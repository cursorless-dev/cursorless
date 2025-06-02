import type { TargetPlainObject } from "@cursorless/common";
import type { DecorationItem } from "shiki";
import { addContentRangeDecorations } from "./addContentRangeDecorations";

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

export { getSourceMarks }
