import type { DecorationItem } from "shiki";
import type { Position } from "@cursorless/common";

/**
 * Merges overlapping decorations. If two decorations overlap, merges their classes and adds "overlap" to the class list.
 * @param decorations Array of decoration objects
 * @returns Array of merged decorations
 */
export function mergeOverlappingDecorations(decorations: DecorationItem[]): DecorationItem[] {
    if (decorations.length === 0) { return []; }

    console.debug("[mergeOverlappingDecorations] decorations:", JSON.stringify(decorations, null, 2));

    // Helper to normalize positions (in case shiki uses offset numbers)
    function isPosition(obj: any): obj is Position {
        return obj && typeof obj.line === "number" && typeof obj.character === "number";
    }

    // Always include zero-width decorations (start == end)
    const zeroWidth = decorations.filter(
        d => isPosition(d.start) && isPosition(d.end) && d.start.line === d.end.line && d.start.character === d.end.character
    );
    // Remove zero-width from main processing
    const nonZeroWidth = decorations.filter(
        d => !(
            isPosition(d.start) && isPosition(d.end) && d.start.line === d.end.line && d.start.character === d.end.character
        )
    );

    console.debug("[mergeOverlappingDecorations] zeroWidth:", JSON.stringify(zeroWidth, null, 2));
    console.debug("[mergeOverlappingDecorations] nonZeroWidth:", JSON.stringify(nonZeroWidth, null, 2));

    // Collect all unique boundary points
    const points: Position[] = [];
    for (const deco of nonZeroWidth) {
        if (isPosition(deco.start) && isPosition(deco.end)) {
            points.push(deco.start, deco.end);
        }
    }
    points.sort((a, b) => a.line !== b.line ? a.line - b.line : a.character - b.character);
    // Remove duplicates
    const uniquePoints: Position[] = [];
    for (const p of points) {
        if (!uniquePoints.length || uniquePoints[uniquePoints.length - 1].line !== p.line || uniquePoints[uniquePoints.length - 1].character !== p.character) {
            uniquePoints.push(p);
        }
    }

    const result: DecorationItem[] = [];
    for (let i = 0; i < uniquePoints.length - 1; ++i) {
        const segStart = uniquePoints[i];
        const segEnd = uniquePoints[i + 1];
        // Find all decorations covering this segment
        const covering = nonZeroWidth.filter(d =>
            isPosition(d.start) && isPosition(d.end) &&
            (d.start.line < segEnd.line || (d.start.line === segEnd.line && d.start.character < segEnd.character)) &&
            (d.end.line > segStart.line || (d.end.line === segStart.line && d.end.character > segStart.character))
        );
        if (covering.length === 0) { continue; }
        if (covering.length === 1) {
            const c = covering[0];
            result.push({
                start: segStart,
                end: segEnd,
                properties: { class: c && c.properties ? c.properties.class : "" },
                alwaysWrap: c && c.alwaysWrap,
            });
        } else {
            // Merge classes and add overlap
            let classNames = covering
                .map(d => (d && d.properties ? d.properties.class : ""))
                .join(" ")
                .split(" ")
                .filter(Boolean);
            classNames = Array.from(new Set(classNames));
            classNames.push("overlap");
            result.push({
                start: segStart,
                end: segEnd,
                properties: { class: classNames.join(" ") },
                alwaysWrap: covering.some(d => d && d.alwaysWrap),
            });
        }
    }
    // Instead of outputting a zero-width selection at the start or end of a range, merge it into the next or previous mark as selectionLeft/selectionRight
    const endPosToIdx = new Map<string, number>(); // end position -> index in result
    const startPosToIdx = new Map<string, number>(); // start position -> index in result
    for (let i = 0; i < result.length; ++i) {
        const deco = result[i];
        if (isPosition(deco.end)) {
            endPosToIdx.set(`${deco.end.line}:${deco.end.character}`, i);
        }
        if (isPosition(deco.start)) {
            startPosToIdx.set(`${deco.start.line}:${deco.start.character}`, i);
        }
    }
    function handleZeroWidthDecoration(
        d: DecorationItem,
        result: DecorationItem[],
        endPosToIdx: Map<string, number>,
        startPosToIdx: Map<string, number>
    ): boolean {
        const className = d.properties?.class;
        console.debug("[handleZeroWidthDecoration] className:", className, "decoration:", JSON.stringify(d, null, 2));
        if (className === "selection") {
            const pos = isPosition(d.start) ? `${d.start.line}:${d.start.character}` : String(d.start);
            const prevIdx = endPosToIdx.get(pos);
            const nextIdx = startPosToIdx.get(pos);
            // Prioritize merging into the next mark (selectionLeft) before previous (selectionRight)
            if (nextIdx !== undefined) {
                // Merge selectionLeft into the next mark
                const next = result[nextIdx];
                const nextClass = next.properties?.class ?? "";
                const newClass = typeof nextClass === "string" && nextClass.split(" ").includes("selectionLeft")
                    ? nextClass
                    : (typeof nextClass === "string" ? (nextClass + " selectionLeft").trim() : "selectionLeft");
                result[nextIdx] = { ...next, properties: { ...next.properties, class: newClass } };
                return true; // handled
            } else if (prevIdx !== undefined) {
                // Merge selectionRight into the previous mark
                const prev = result[prevIdx];
                const prevClass = prev.properties?.class ?? "";
                const newClass = typeof prevClass === "string" && prevClass.split(" ").includes("selectionRight")
                    ? prevClass
                    : (typeof prevClass === "string" ? (prevClass + " selectionRight").trim() : "selectionRight");
                result[prevIdx] = { ...prev, properties: { ...prev.properties, class: newClass } };
                return true; // handled
            }
            return false; // not handled
        } else if (typeof className === "string" && className.includes("full")) {
            // Allow decoration classes (e.g., decoration justAdded full) to pass through
            return false; // not handled, will be added to filteredZeroWidth
        } else {
            console.error("[handleZeroWidthDecoration] Unhandled zero-width decoration class:", className, d);
            throw new Error(`Unhandled zero-width decoration class: ${className}`);
        }
    }
    const filteredZeroWidth: DecorationItem[] = [];
    for (const d of zeroWidth) {
        if (!handleZeroWidthDecoration(d, result, endPosToIdx, startPosToIdx)) {
            filteredZeroWidth.push(d);
        }
    }
    return result.concat(filteredZeroWidth);
}
