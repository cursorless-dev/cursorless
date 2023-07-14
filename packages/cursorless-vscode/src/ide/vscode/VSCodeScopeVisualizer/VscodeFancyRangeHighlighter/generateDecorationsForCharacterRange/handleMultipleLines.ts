import { Range } from "@cursorless/common";
import {
  BorderStyle,
  DecorationStyle,
  StyledRange,
} from "../decorationStyle.types";
import { flatmap } from "itertools";
import { generateLineInfos, LineInfo } from "./generateLineInfos";

/**
 * Generates decorations for a range, which has already been split up into line
 * ranges.  This function implements the core logic that determines how we
 * render multiline ranges, ensuring that we use dotted borders to indicate line
 * continuations.
 *
 * @param lineRanges A list of ranges, one for each line in the given range,
 * with the first and last ranges trimmed to the start and end of the original
 * range.
 */
export function* handleMultipleLines(
  lineRanges: Range[],
): Iterable<StyledRange> {
  yield* flatmap(generateLineInfos(lineRanges), handleLine);
}

/**
 * Returns an iterable of decorations to use to render the given line. Because
 * we may want to use different borders to render different parts of the line,
 * depending what is above and below the line, we may yield multiple decorations
 * for a single line.
 *
 * We move from the start of the line to the end, keeping a state machine to
 * keep track of what borders we should render.  At each character where the
 * previous, current, or next line starts or ends, we transition states, and
 * potentially yield a decoration.
 * @param lineInfo Info about the line to render, including context about the
 * previous and next lines.
 */
function* handleLine(lineInfo: LineInfo): Iterable<StyledRange> {
  const { lineNumber, previousLine, currentLine, nextLine } = lineInfo;

  /** A list of "events", corresponding to the start or end of a line */
  const events: Event[] = getEvents(lineInfo);

  /**
   * Keep track of current borders, except for `right`, which is computed on
   * the fly.
   */
  const currentDecoration: Omit<DecorationStyle, "right"> = {
    // Draw a solid top line if whatever is above us isn't part of our range.
    // Otherwise draw no line so it merges in with the line above.
    top:
      previousLine == null || previousLine.isFirst
        ? BorderStyle.solid
        : BorderStyle.none,
    // Analogous to above, but only care if we're last; doesn't matter if next
    // line is last because it is guaranteed to start at char 0
    bottom: currentLine.isLast ? BorderStyle.solid : BorderStyle.none,
    // Start with a porous border if we're continuing from previous line
    left: currentLine.isFirst ? BorderStyle.solid : BorderStyle.porous,
  };

  let currentOffset = currentLine.start;
  let yieldedAnything = false;
  let isDone = false;

  for (const { offset, lineType, isStart } of events) {
    if (isDone) {
      break;
    }

    if (offset > currentOffset) {
      // If we've moved forward at all since the last event, yield a decoration
      // for the range between the last event and this one.
      yield {
        range: new Range(lineNumber, currentOffset, lineNumber, offset),
        style: {
          ...currentDecoration,
          // If we're done with this line, draw a border, otherwise don't, so that
          // it merges in with the next decoration for this line.
          right:
            offset === currentLine.end
              ? currentLine.isLast
                ? BorderStyle.solid
                : BorderStyle.porous
              : BorderStyle.none,
        },
      };
      yieldedAnything = true;
      currentDecoration.left = BorderStyle.none;
    }

    switch (lineType) {
      case LineType.previous:
        // Use no top border when overlapping with previous line so it visually
        // merges; otherwise use porous border to show nice cutoff effect.
        currentDecoration.top = isStart ? BorderStyle.none : BorderStyle.porous;
        break;
      case LineType.current:
        if (!isStart) {
          isDone = true;
        }
        break;
      case LineType.next:
        // Blend with next line while it is overlapping with us; then switch
        // to solid or porous, depending if it is the last line.
        if (isStart) {
          currentDecoration.bottom = BorderStyle.none;
        } else {
          currentDecoration.bottom = nextLine!.isLast
            ? BorderStyle.solid
            : BorderStyle.porous;
        }
        break;
    }

    if (currentOffset < offset) {
      // This guard is necessary so we don't accidentally jump backward if an
      // adjacent line starts before we do.
      currentOffset = offset;
    }
  }

  if (!yieldedAnything) {
    yield {
      range: new Range(
        lineNumber,
        currentLine.start,
        lineNumber,
        currentLine.end,
      ),
      style: {
        ...currentDecoration,
        right: currentLine.isLast ? BorderStyle.solid : BorderStyle.porous,
      },
    };
  }
}

interface Event {
  offset: number;
  lineType: LineType;
  isStart: boolean;
}

enum LineType {
  previous = -1,
  current = 0,
  next = 1,
}

/**
 * Generate "events" for our state machine.
 * @param param0 Info about the line to render
 * @returns A list of "events", corresponding to the start or end of a line
 */
function getEvents({ previousLine, currentLine, nextLine }: LineInfo) {
  const events: Event[] = [];

  if (previousLine != null) {
    events.push(
      {
        offset: previousLine.start,
        lineType: LineType.previous,
        isStart: true,
      },
      {
        offset: previousLine.end,
        lineType: LineType.previous,
        isStart: false,
      },
    );
  }

  // Note that the current and next line will always start before or equal to
  // our starting offset, so we don't need to add events for them.
  events.push({
    offset: currentLine.end,
    lineType: LineType.current,
    isStart: false,
  });

  if (nextLine != null) {
    events.push({
      offset: nextLine.end,
      lineType: LineType.next,
      isStart: false,
    });
  }

  // Sort the events by offset.  If two events have the same offset, we want to
  // handle the current line last, so that it takes into account whether an adjacent
  // line has started or ended.  If two events have the same offset and line type,
  // we want to handle the start event first, as we always assume we'll handle a
  // line beginning before it ends.
  events.sort((a, b) => {
    if (a.offset === b.offset) {
      if (a.lineType === LineType.current) {
        return 1;
      }
      return a.isStart ? -1 : 1;
    }

    return a.offset - b.offset;
  });

  return events;
}
