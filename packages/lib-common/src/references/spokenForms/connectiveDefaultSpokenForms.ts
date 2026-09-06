export const connectiveDefaultSpokenForms = {
  rangeExclusive: "between",
  rangeInclusive: "past",
  // Note: rangeExcludingStart has no default spoken form
  rangeExcludingStart: null,
  rangeExcludingEnd: "until",
  listConnective: "and",
  swapConnective: "with",
  verticalRange: "slice",
  at: "at",
  on: "on",
} as const;

export const insertionModeDefaultSpokenForms = {
  to: "to",
  before: "before",
  after: "after",
} as const;
