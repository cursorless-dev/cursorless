import type { SerializedMarks } from "@cursorless/common";
import type { DecorationItem } from "shiki";
import type { classesMap } from "./classesMap";
import { getDecorationClass } from "./classesMap";

function getMarkDecorations({
    marks,
    lines
}: {
    marks?: SerializedMarks;
    lines?: string[]
}): DecorationItem[] {
    const decorations: DecorationItem[] = [];

    Object.entries(marks || {}).forEach(([key, { start }]) => {
        const [hatType, letter] = key.split(".") as [keyof typeof classesMap, string];

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
                `Letter"${letter}" not found after position ${searchStart} in line:"${currentLine}"`
            );
            return; // Skip this mark if the letter is not found
        }

        const decorationItem: DecorationItem = {
            start,
            end: { line: start.line, character: nextLetterIndex + 1 },
            properties: {
                class: getDecorationClass(hatType),
            },
            alwaysWrap: true,
        }

        decorations.push(decorationItem);
    });

    return decorations;
}

export { getMarkDecorations }
