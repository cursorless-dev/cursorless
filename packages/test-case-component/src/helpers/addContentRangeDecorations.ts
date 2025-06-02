import type { TargetPlainObject } from "@cursorless/common";
import type { DecorationItem } from "shiki";
import { getDecorationClass, type classesMap } from "./classesMap";

function addContentRangeDecorations({
    marks,
    highlightClass,
    decorations,
}: {
    marks: TargetPlainObject[];
    highlightClass: keyof typeof classesMap
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

export { addContentRangeDecorations }
