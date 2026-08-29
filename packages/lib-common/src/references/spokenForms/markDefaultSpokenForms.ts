import type { PartialMark } from "../../types/command/PartialTargetDescriptor.types";

type MarkType = PartialMark["type"];

export const hatColorDefaultSpokenForms: Record<string, string | null> = {
  blue: "blue",
  green: "green",
  red: "red",
  pink: "pink",
  yellow: "yellow",
  userColor1: "navy",
  userColor2: "apricot",
  userColor3: "user color three",
  userColor4: "user color four",

  default: null,
};

export const hatShapeDefaultSpokenForms: Record<string, string | null> = {
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

export const markDefaultSpokenForms = {
  cursor: "this",
  that: "that",
  source: "source",
  nothing: "nothing",

  keyboard: null,
  explicit: null,
  decoratedSymbol: null,
  lineNumber: null,
  range: null,
  target: null,
} as const satisfies Record<MarkType, string | null>;

export const lineDirectionDefaultSpokenForms = {
  modulo100: "row",
  relativeUp: "up",
  relativeDown: "down",
} as const;
