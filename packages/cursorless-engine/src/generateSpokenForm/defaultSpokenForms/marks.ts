import { PartialMark } from "@cursorless/common";

const hatColors: Record<string, string | null> = {
  blue: "blue",
  green: "green",
  red: "red",
  pink: "pink",
  yellow: "yellow",
  userColor1: "navy",
  userColor2: "apricot",

  default: null,
};

const hatShapes: Record<string, string | null> = {
  ex: "ex",
  fox: "fox",
  wing: "wing",
  hole: "hole",
  frame: "frame",
  curve: "curve",
  eye: "eye",
  play: "play",
  crosshairs: "cross",
  bolt: "bolt",

  default: null,
};

type MarkType = PartialMark["type"];

export const marks = {
  cursor: "this",
  that: "that",
  source: "source",
  nothing: "nothing",

  keyboard: null,
  explicit: null,
  decoratedSymbol: null,
  lineNumber: null,
  range: null,
} as const satisfies Record<MarkType, string | null>;

export const lineDirections = {
  modulo100: "row",
  relativeUp: "up",
  relativeDown: "down",
};

export function hatColorToSpokenForm(color: string): string {
  const result = hatColors[color];
  if (result == null) {
    throw Error(`Unknown hat color '${color}'`);
  }
  return result;
}

export function hatShapeToSpokenForm(shape: string): string {
  const result = hatShapes[shape];
  if (result == null) {
    throw Error(`Unknown hat shape '${shape}'`);
  }
  return result;
}
