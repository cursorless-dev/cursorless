import type { PlainSpyIDERecordedValues } from "@cursorless/common";
import type { DecorationItem } from "shiki";
import { isLineRange, isPositionRange } from "../typeGuards";
import { getDecorationClass } from "../classesMap";

function getIdeFlashDecorations({
    ide,
    lines,
}: {
    ide?: PlainSpyIDERecordedValues;
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
            for (let line = lineStart; line <= lineEnd; line++) {
                if (line >= lines.length) {
                    continue
                }
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
            decorations.push(decorationItem);
        } else {
            console.warn(`Unknown range type "${type}". Skipping this flash.`);
        }
    });

    return decorations;
}

export { getIdeFlashDecorations }
