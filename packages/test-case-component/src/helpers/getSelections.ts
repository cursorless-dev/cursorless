import type { SelectionPlainObject } from "@cursorless/common";
import type { DecorationItem } from "shiki";
import { getDecorationClass } from "./classesMap";

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
    })

    return decorations
}

export { getSlections }
