import type { TargetPlainObject } from "@cursorless/common";
import type { DecorationItem } from "shiki";
import { addContentRangeDecorations } from "./addContentRangeDecorations";

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

export { getThatMarks }
