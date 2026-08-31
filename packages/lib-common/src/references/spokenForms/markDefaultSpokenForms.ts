import type { PartialMark } from "../../types/command/PartialTargetDescriptor.types";

type MarkType = PartialMark["type"];

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

export const unknownSymbolMarkDefaultSpokenForm = "special";

export const lineDirectionDefaultSpokenForms = {
  modulo100: "row",
  relativeUp: "up",
  relativeDown: "down",
} as const;
