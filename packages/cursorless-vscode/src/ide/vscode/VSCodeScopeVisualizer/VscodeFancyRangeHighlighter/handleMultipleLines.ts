import { Range } from "@cursorless/common";
import {
  BorderStyle,
  DecorationStyle,
  DecoratedRange,
} from "./getDecorationRanges.types";
import { flatmap } from "itertools";

export function* handleMultipleLines(
  lineRanges: Range[],
): Iterable<DecoratedRange> {
  yield* flatmap(generateLineGroupings(lineRanges), handleLine);
}

export function* generateLineGroupings(
  lineRanges: Range[],
): Iterable<LineGrouping> {
  for (let i = 0; i < lineRanges.length; i++) {
    const previousLine = i === 0 ? null : lineRanges[i - 1];
    const currentLine = lineRanges[i];
    const nextLine = i === lineRanges.length - 1 ? null : lineRanges[i + 1];
    yield {
      lineNumber: currentLine.start.line,

      previousLine:
        previousLine == null
          ? null
          : {
              start: previousLine.start.character,
              end: previousLine.end.character,
              isFirst: i === 1,
              isLast: false,
            },

      currentLine: {
        start: currentLine.start.character,
        end: currentLine.end.character,
        isFirst: i === 0,
        isLast: i === lineRanges.length - 1,
      },

      nextLine:
        nextLine == null
          ? null
          : {
              start: nextLine.start.character,
              end: nextLine.end.character,
              isFirst: false,
              isLast: i === lineRanges.length - 2,
            },
    };
  }
}

interface LineGrouping {
  lineNumber: number;
  previousLine: Line | null;
  currentLine: Line;
  nextLine: Line | null;
}

interface Line {
  start: number;
  end: number;
  isFirst: boolean;
  isLast: boolean;
}

function* handleLine({
  lineNumber,
  previousLine,
  currentLine,
  nextLine,
}: LineGrouping): Iterable<DecoratedRange> {
  const events: Event[] = [
    ...(previousLine == null
      ? []
      : [
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
        ]),
    {
      offset: currentLine.end,
      lineType: LineType.current,
      isStart: false,
    },
    ...(nextLine == null
      ? []
      : [
          {
            offset: nextLine.end,
            lineType: LineType.next,
            isStart: false,
          },
        ]),
  ];

  events.sort((a, b) => {
    if (a.offset === b.offset) {
      if (a.lineType === LineType.current) {
        return 1;
      }
      return a.isStart ? -1 : 1;
    }

    return a.offset - b.offset;
  });

  const currentDecoration: DecorationStyle = {
    top:
      previousLine == null || previousLine.isFirst
        ? BorderStyle.solid
        : BorderStyle.none,
    bottom: currentLine.isLast ? BorderStyle.solid : BorderStyle.none,
    left: currentLine.isFirst ? BorderStyle.solid : BorderStyle.porous,
    right: BorderStyle.none,
  };

  let currentOffset = currentLine.start;
  let yieldedAnything = false;
  let isDone = false;

  for (const { offset, lineType, isStart } of events) {
    if (isDone) {
      break;
    }
    if (offset > currentOffset) {
      yield {
        range: new Range(lineNumber, currentOffset, lineNumber, offset),
        style: {
          ...currentDecoration,
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
        if (isStart) {
          currentDecoration.top = BorderStyle.none;
        } else {
          currentDecoration.top = BorderStyle.porous;
        }
        break;
      case LineType.current:
        if (!isStart) {
          isDone = true;
        }
        break;
      case LineType.next:
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
