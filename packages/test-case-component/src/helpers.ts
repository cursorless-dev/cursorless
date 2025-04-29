import type {
  // PositionPlainObject,
  SelectionPlainObject,
  SerializedMarks,
  TargetPlainObject,
} from "@cursorless/common";

import type { DecorationItem } from "shiki"

/**
 * Splits a string into an array of objects containing the line content
 * and the cumulative offset from the start of the string.
 *
 * @param {string} documentContents - The string to split into lines.
 * @returns {{ line: string, offset: number }[]} An array of objects with line content and cumulative offset.
 */
function splitDocumentWithOffsets(documentContents: string): { line: string; offset: number }[] {
  const lines = documentContents.split("\n");
  let cumulativeOffset = 0;

  return lines.map((line) => {
    const result = { line, offset: cumulativeOffset };
    cumulativeOffset += line.length + 1; // +1 for the newline character
    return result;
  });
}

/**
 * Creates decorations based on the split document with offsets and marks.
 *
 * @param {Object} options - An object containing optional fields like marks, command, or ide.
 * @param {SerializedMarks} [options.marks] - An object containing marks with line, start, and end positions.
 * @param {any} [options.command] - (Optional) The command object specifying the command details.
 * @param {any} [options.ide] - (Optional) The ide object specifying the IDE details.
 * @returns {DecorationItem[]} An array of decoration objects.
 */
function createDecorations(
  options: {
    marks?: SerializedMarks;
    command?: any;
    ide?: any;
    lines?: string[]
    selections?: SelectionPlainObject[]
    thatMark?: TargetPlainObject[]
  } = {} // Default to an empty object
): DecorationItem[] {
  const { marks, ide, lines, selections, thatMark /* command */ } = options
  if (thatMark) {
    console.log("📅", thatMark)
  }

  const decorations: DecorationItem[] = [];
  const markDecorations = getMarkDecorations({ marks, lines })
  const ideFlashDecorations = getIdeFlashDecorations({ lines, ide })
  decorations.push(...markDecorations);
  decorations.push(...ideFlashDecorations);
  const selectionRanges = getSlections({ selections })
  decorations.push(...selectionRanges);

  if (thatMark) {
    const modificationReferences = getThatMarks({ thatMark })
    decorations.push(...modificationReferences);
  }

  return decorations

}

/**
 * Generates Shiki decorations for marks on a specific line.
 *
 * @param {Object} params - The parameters for generating decorations.
 * @param {SerializedMarks} [params.marks] - An object containing serialized marks with start and end positions.
 * @param {number} params.index - The index of the current line being processed.
 * @param {{ line: string; offset: number }} params.lineData - The line content and its cumulative offset.
 * @returns {DecorationItem[]} An array of Shiki decorations for the specified line.
 *
 */
function getMarkDecorations({
  marks,
  lines
}: {
  marks?: SerializedMarks;
  lines?: string[]
}): DecorationItem[] {
  const decorations: DecorationItem[] = [];

  Object.entries(marks || {}).forEach(([key, { start, end }]) => {
    const [hatType, letter] = key.split(".") as [keyof typeof classesMap, string];
    console.log("🔑", key, start, end);

    const markLineStart = start.line

    if (!lines) {
      console.warn("Lines are undefined. Skipping decoration generation.");
      return [];
    }
    const currentLine = lines[markLineStart]

    const searchStart = start.character;
    const nextLetterIndex = currentLine.indexOf(letter, searchStart);

    if (nextLetterIndex === -1) {
      console.warn(
        `Letter "${letter}" not found after position ${searchStart} in line: "${currentLine}"`
      );
      return; // Skip this mark if the letter is not found
    }

    const decorationItem: DecorationItem = {
      start,
      end: { line: start.line, character: nextLetterIndex + 1 },
      properties: {
        class: getDecorationClass(hatType), // Replace with the desired class name for marks
      },
      alwaysWrap: true,
    }

    console.log("🔑🔑", decorationItem)

    decorations.push(decorationItem);
  });

  return decorations;
}

type LineRange = { type: string; start: number; end: number }
type PositionRange = { type: string; start: { line: number; character: number }; end: { line: number; character: number } };

type RangeType =
  | LineRange
  | PositionRange


function getIdeFlashDecorations({
  ide,
  lines,
}: {
  ide?: {
    flashes?: { style: keyof typeof classesMap; range: RangeType }[];
  };
  lines?: string[];
} = {}): DecorationItem[] {
  if (!lines) {
    console.warn("Lines are undefined. Skipping line decorations.");
    return [];
  }

  if (!ide?.flashes || !Array.isArray(ide.flashes)) {
    console.warn("No flashes found in IDE. Skipping line decorations.");
    return [];
  }

  const decorations: DecorationItem[] = [];

  const { flashes } = ide

  flashes.forEach(({ style, range }) => {
    const { type } = range;

    if (isLineRange(range)) {
      const { start: lineStart, end: lineEnd } = range

      /* Split a multi-line range into single lines so that shiki doesn't add
       * multiple classes to the same span causing CSS conflicts
       */
      for (let line = lineStart; line <= lineEnd; line++) {
        const contentLine = lines[line];
        const startPosition = { line, character: 0 };
        const endPosition = { line, character: contentLine.length };
        const decorationItem = {
          start: startPosition,
          end: endPosition,
          properties: {
            class: `${getDecorationClass(style)} full`,
          },
          alwaysWrap: true,
        };
        console.log("🔥🔥", decorationItem);
        decorations.push(decorationItem);
      }

    } else if (isPositionRange(range)) {
      const { start: rangeStart, end: rangeEnd } = range;
      const decorationItem = {
        start: rangeStart,
        end: rangeEnd,
        properties: {
          class: getDecorationClass(style),
        },
        alwaysWrap: true,
      }
      console.log("🔥🔥", decorationItem)
      decorations.push(decorationItem);
    } else {
      console.warn(`Unknown range type "${type}". Skipping this flash.`);
    }
  });

  return decorations;
}

function getSlections(
  {
    selections,
  }: {
    selections?: SelectionPlainObject[];
    lines?: string[]
  }): DecorationItem[] {
  const decorations: DecorationItem[] = [];
  if (selections === undefined || selections.length === 0) {
    console.warn("Lines are undefined. Skipping decoration generation.");
    return []
  }
  selections.forEach(({ anchor, active }) => {
    const decorationItem = {
      start: anchor,
      end: active,
      properties: {
        class: getDecorationClass("selection"),
      },
      alwaysWrap: true,
    }
    decorations.push(decorationItem)
    console.log("🟦", decorationItem)
  })

  return decorations
}

function getThatMarks({ thatMark }: { thatMark: TargetPlainObject[] }): DecorationItem[] {
  const decorations: DecorationItem[] = [];

  if (thatMark === undefined || thatMark.length === 0) {
    console.warn("finalStateSourceMarks are undefined. Skipping decoration generation.");
    return []
  } else {
    addContentRangeDecorations({
      marks: thatMark,
      highlightClass: "thatMark", decorations
    });
  }

  return decorations
}

function getSourceMarks({ sourceMark }: { sourceMark?: TargetPlainObject[] }): DecorationItem[] {
  const decorations: DecorationItem[] = [];
  if (sourceMark === undefined || sourceMark.length === 0) {
    console.warn("finalStateSourceMarks are undefined. Skipping decoration generation.");
    return []
  } else {
    addContentRangeDecorations({
      marks: sourceMark,
      highlightClass: "sourceMark", decorations
    });
  }

  return decorations
}

// Type guard for line range
function isLineRange(range: RangeType): range is LineRange {
  return typeof range.start === "number"
    && typeof range.end === "number"
    && range.type === "line";
}

// Type guard for position range
function isPositionRange(
  range: RangeType
): range is PositionRange {
  return typeof range.start === "object"
    && typeof range.end === "object"
    && range.type === "character";
}

function addContentRangeDecorations({
  marks,
  highlightClass,
  decorations,
}: {
  marks: TargetPlainObject[];
  highlightClass: keyof typeof classesMap;
  decorations: DecorationItem[];
}): void {
  marks.forEach(({ contentRange }) => {
    const { start, end } = contentRange;
    const decorationItem = {
      start,
      end,
      properties: {
        class: getDecorationClass(highlightClass),
      },
      alwaysWrap: true,
    };
    decorations.push(decorationItem);
  });
}

const DEFAULT_HAT_CLASS = "hat default";
const classesMap = {
  default: DEFAULT_HAT_CLASS,
  pendingDelete: "decoration pendingDelete",
  referenced: "decoration referenced",
  selection: "selection",
  pendingModification0: "decoration pendingModification0",
  pendingModification1: "decoration pendingModification1",
  justAdded: "decoration justAdded",
  highlight0: "decoration highlight0",
  highlight1: "decoration highlight1",
  sourceMark: "sourceMark",
  thatMark: "thatMark"
};

function getDecorationClass(key: keyof typeof classesMap): string {
  return classesMap[key];
}


export {
  splitDocumentWithOffsets,
  createDecorations
}