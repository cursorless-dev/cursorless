type LineRange = { type: string; start: number; end: number }
type PositionRange = { type: string; start: { line: number; character: number }; end: { line: number; character: number } };
type RangeType = LineRange | PositionRange;

function isLineRange(range: RangeType): range is LineRange {
    return typeof range.start === "number"
        && typeof range.end === "number"
        && range.type === "line";
}

function isPositionRange(
    range: RangeType
): range is PositionRange {
    return typeof range.start === "object"
        && typeof range.end === "object"
        && range.type === "character";
}

export { isLineRange, isPositionRange }
export type { PositionRange, RangeType }
