import type { LineRange, PositionRange, RangeType } from "../types";

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
