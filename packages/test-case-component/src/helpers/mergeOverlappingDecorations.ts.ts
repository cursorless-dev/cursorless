import type { DecorationItem } from "shiki";
import type { Position } from "@cursorless/common";

/**
 * Merges overlapping decorations. If two decorations overlap, merges their classes and adds "overlap" to the class list.
 * @param decorations Array of decoration objects
 * @returns Array of merged decorations
 */
export function mergeOverlappingDecorations(decorations: DecorationItem[]): DecorationItem[] {
    if (decorations.length === 0) { return []; }

    // Helper to normalize positions (in case shiki uses offset numbers)
    function isPosition(obj: any): obj is Position {
        return obj && typeof obj.line === "number" && typeof obj.character === "number";
    }

    // Collect all unique boundary points
    const points: Position[] = [];
    for (const deco of decorations) {
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
        const covering = decorations.filter(d =>
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
    return result;
}
