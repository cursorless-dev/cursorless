// Hat shape SVG path data — copied VERBATIM from
// cursorless/resources/images/hats/{shape}.svg (verified 2026-06-08).
// Only `crosshairs` carries fill-rule="evenodd" clip-rule="evenodd"; every
// other shape uses the SVG default (nonzero). `ex` is a single subpath (no hole).
// SPEC §4.1 / DECISIONS.md CORRECTION.

export type HatShape =
  | "default"
  | "bolt"
  | "curve"
  | "fox"
  | "frame"
  | "play"
  | "wing"
  | "hole"
  | "ex"
  | "crosshairs"
  | "eye";

export const HAT_SHAPES: HatShape[] = [
  "default",
  "bolt",
  "curve",
  "fox",
  "frame",
  "play",
  "wing",
  "hole",
  "ex",
  "crosshairs",
  "eye",
];

export interface ShapePath {
  d: string;
  /** Only set for crosshairs. */
  fillRule?: "evenodd";
}

// d= strings are byte-for-byte from the source SVGs.
export const SHAPE_PATHS: Record<HatShape, ShapePath> = {
  default: {
    d: "M6 9C9.31371 9 12 6.98528 12 4.5C12 2.01472 9.31371 0 6 0C2.68629 0 0 2.01472 0 4.5C0 6.98528 2.68629 9 6 9Z",
  },
  bolt: {
    d: "M12 4V0C12 0 9 5 8 5C7 5 3 0 3 0L0 5V9C0 9 3 5 4 5C5 5 9 9 9 9L12 4Z",
  },
  curve: {
    d: "M6.00016 3.5C10 3.5 12 7.07378 12 9C12 4 10.5 0 6.00016 0C1.50032 0 0 4 0 9C0 7.07378 2.00032 3.5 6.00016 3.5Z",
  },
  fox: {
    d: "M6.00001 9L0 0C0 0 3.71818 2.5 6 2.5C8.28182 2.5 12 0 12 0L6.00001 9Z",
  },
  frame: {
    d: "M0 0.000115976V8.99988H12V0L0 0.000115976ZM9.5 6.5H6H2.5V4.5V2.5H6H9.5V4.5V6.5Z",
  },
  play: {
    d: "M12 4.49999L0 9C0 9 3 6.2746 3 4.49999C3 2.72537 0 0 0 0L12 4.49999Z",
  },
  wing: {
    d: "M6 0C6 0 7 3 8.5 4.5C10 6 12 7 12 7V9C12 9 8.5 7 6 7C3.5 7 0 9 0 9V7C0 7 2 6 3.5 4.5C5 3 6 0 6 0Z",
  },
  hole: {
    d: "M1.5 4.5L0 7H2.5L3.5 9L6 7.5L8.5 9L9.5 7H12L10.5 4.5L12 2H9.5L8.5 0L6 1.5L3.5 0L2.5 2H0Z M6 5.5L4 6.5L3 4.5L4 2.5L6 3.5L8 2.5L9 4.5L8 6.5L6 5.5Z",
  },
  ex: {
    d: "M9.99997 9C9.99997 9 7.5 6.5 6 6.5C4.5 6.5 2 9 2 9C2 9 0.999999 9 0 9C0 9 2.5 6 2.5 4.5C2.5 3 6.5473e-05 0 6.5473e-05 0C6.5473e-05 0 1 0 2 0C2 0 4.5 2.5 6 2.5C7.5 2.5 9.99997 0 9.99997 0C11 0 12 0 12 0C12 0 9.5 3 9.5 4.5C9.5 6 12 9 12 9C12 9 11 9 9.99997 9Z",
  },
  crosshairs: {
    d: "M5.25 0C5.25 0 4.5 1.5 3.5 2.5C2.49483 3.50517 0 3.75 0 3.75V5.25C0 5.25 2.49483 5.49483 3.5 6.5C4.5 7.5 5.25 9 5.25 9H6.75C6.75 9 7.5 7.5 8.5 6.5C9.50517 5.49483 12 5.25 12 5.25V3.75C12 3.75 9.50517 3.50517 8.5 2.5C7.5 1.5 6.75 0 6.75 0H5.25ZM5.75 6.5H6.25C6.25 6.5 6.58435 5.25599 7 5C7.41565 4.74401 8.75 4.75 8.75 4.75V4.25C8.75 4.25 7.41565 4.25599 7 4C6.58435 3.74401 6.25 2.5 6.25 2.5H5.75C5.75 2.5 5.41565 3.74401 5 4C4.58435 4.25599 3.25 4.25 3.25 4.25V4.75C3.25 4.75 4.58435 4.74401 5 5C5.41565 5.25599 5.75 6.5 5.75 6.5Z",
    fillRule: "evenodd",
  },
  eye: {
    d: "M12 4L6.5 0H5.5L0 4V5L5.5 9H6.5L12 5V4ZM6 7.5C6 7.5 4.5 6.5 4.5 4.5C4.5 2.5 6.01103 1.5 6 1.5C6 1.5 7.5 2.5 7.5 4.5C7.5 6.5 6 7.5 6 7.5Z",
  },
};

/**
 * Per-shape adjustments, ported from
 * cursorless/.../hats/shapeAdjustments.ts (verified 2026-06-08).
 * sizeAdjustment is a PERCENT (e.g. -30 = -0.30 fraction).
 * verticalOffset is a PERCENT applied /100 to em (e.g. -5 = -0.05em).
 */
export interface ShapeAdjustment {
  /** percent */
  sizeAdjustment?: number;
  /** percent → em/100 */
  verticalOffset?: number;
  /** deferred (two-tone stroke, SPEC §7) */
  strokeFactor?: number;
}

export const SHAPE_ADJUSTMENTS: Record<HatShape, ShapeAdjustment> = {
  default: { sizeAdjustment: -30 },
  ex: { sizeAdjustment: -12.5 },
  fox: { sizeAdjustment: -5 },
  wing: { sizeAdjustment: -2.5 },
  hole: { strokeFactor: 0.7 },
  frame: { sizeAdjustment: -20 },
  curve: { verticalOffset: -5 },
  eye: {},
  play: {},
  bolt: {},
  crosshairs: {},
};

export const DEFAULT_HAT_HEIGHT_EM = 0.36;
export const DEFAULT_VERTICAL_OFFSET_EM = 0.05;
