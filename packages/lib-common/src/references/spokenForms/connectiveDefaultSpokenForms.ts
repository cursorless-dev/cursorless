export const connectiveDefaultSpokenForms = {
  rangeExclusive: "between",
  rangeInclusive: "past",
  // Note: rangeExcludingStart has no default spoken form
  rangeExcludingStart: null,
  rangeExcludingEnd: "until",
  listConnective: "and",
  swapConnective: "with",
  sourceDestinationConnective: "to",
  before: "before",
  after: "after",
  verticalRange: "slice",

  first: "first",
  last: "last",
  previous: "previous",
  next: "next",
  forward: "forward",
  backward: "backward",

  at: "at",
  on: "on",
} as const;
