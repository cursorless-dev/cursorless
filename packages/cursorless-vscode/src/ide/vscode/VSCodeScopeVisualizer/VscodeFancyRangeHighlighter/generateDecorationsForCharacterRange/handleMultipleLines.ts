import { Range } from "@cursorless/common";
import type { DecorationStyle, StyledRange } from "../decorationStyle.types";
import { BorderStyle } from "../decorationStyle.types";
import { flatmap } from "itertools";
import type { LineInfo } from "./generateLineInfos";
import { generateLineInfos } from "./generateLineInfos";

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
  const { lineNumber, currentLine, nextLine } = lineInfo;

  /** A list of "events", corresponding to the start or end of a line */
  const events: Event[] = getEvents(lineInfo);

  /**
   * Keep track of current borders, except for `right`, which is computed on
   * the fly.
   */
  const currentDecoration: Omit<DecorationStyle, "right"> = {
    // Start with a solid top border. We'll switch to no border when previous
    // line begins.  Don't need to worry about porous because only the first
    // line can start after char 0.
    top: BorderStyle.solid,

    // Start with a solid bottom border if we're the last line, otherwise no
    // border because we'll blend with the next line.
    bottom: currentLine.isLast ? BorderStyle.solid : BorderStyle.none,

    // Start with a porous border if we're continuing from previous line
    left: currentLine.isFirst ? BorderStyle.solid : BorderStyle.porous,
  };

  let currentOffset = currentLine.start;
  let yieldedAnything = false;

  // NB: The `loop` label here allows us to break out of the loop from inside
  // the switch statement.
  loop: for (const event of events) {
    if (event.offset > currentOffset) {
      // If we've moved forward at all since the last event, yield a decoration
      // for the range between the last event and this one.
      yield {
        range: new Range(lineNumber, currentOffset, lineNumber, event.offset),
        style: {
          ...currentDecoration,
          // If we're done with this line, draw a right border, otherwise don't,
          // so that it merges in with the next decoration for this line.
          right:
            event.offset === currentLine.end
              ? currentLine.isLast
                ? BorderStyle.solid
                : BorderStyle.porous
              : BorderStyle.none,
        },
      };
      yieldedAnything = true;
      currentDecoration.left = BorderStyle.none;
      currentOffset = event.offset;
    }

    switch (event.lineType) {
      case LineType.previous:
        // Use no top border when overlapping with previous line so it visually
        // merges; otherwise use porous border to show nice cutoff effect.
        currentDecoration.top = event.isLineStart
          ? BorderStyle.none
          : BorderStyle.porous;
        break;
      case LineType.current: // event.isLineStart === false
        break loop;
      case LineType.next: // event.isLineStart === false
        currentDecoration.bottom = nextLine!.isLast
          ? BorderStyle.solid
          : BorderStyle.porous;
        break;
    }
  }

  if (!yieldedAnything) {
    // If current line is empty, then we didn't yield anything in the loop above,
    // so yield a decoration for the whole line.
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

interface LineEventBase {
  /**
   * The character offset at which this event occurs.  This is the offset of the
   * character that is the start or end of the line, depending on whether
   * `isLineStart` is true or false.
   */
  offset: number;

  /**
   * The type of line that this event corresponds to.
   * -1: previous line
   * 0: current line
   * 1: next line
   */
  lineType: LineType;

  /**
   * Whether this event corresponds to the start of a line.  If `false`, it
   * corresponds to the end of a line.
   */
  isLineStart: boolean;
}

interface PreviousLineEvent extends LineEventBase {
  offset: number;
  lineType: LineType.previous;
  isLineStart: boolean;
}

interface CurrentLineEvent extends LineEventBase {
  offset: number;
  lineType: LineType.current;
  isLineStart: false;
}

interface NextLineEvent extends LineEventBase {
  offset: number;
  lineType: LineType.next;
  isLineStart: false;
}

type Event = PreviousLineEvent | CurrentLineEvent | NextLineEvent;

enum LineType {
  previous = -1,
  current = 0,
  next = 1,
}

/**
 * Generate "events" for our state machine.
 * @param lineInfo Info about the line to render
 * @returns A list of "events", corresponding to the start or end of a line
 */
function getEvents({ previousLine, currentLine, nextLine }: LineInfo) {
  const events: Event[] = [];

  if (previousLine != null) {
    events.push(
      {
        offset: previousLine.start,
        lineType: LineType.previous,
        isLineStart: true,
      },
      {
        offset: previousLine.end,
        lineType: LineType.previous,
        isLineStart: false,
      },
    );
  }

  // Note that the current and next line will always start before or equal to
  // our starting offset, so we don't need to add events for them.
  events.push({
    offset: currentLine.end,
    lineType: LineType.current,
    isLineStart: false,
  });

  if (nextLine != null) {
    events.push({
      offset: nextLine.end,
      lineType: LineType.next,
      isLineStart: false,
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
      return a.isLineStart ? -1 : 1;
    }

    return a.offset - b.offset;
  });

  return events;
}
