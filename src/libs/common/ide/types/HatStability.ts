export interface HatStability {
  /**
   * Determines how Cursorless decides whether a token should keep its own hat
   * if a higher ranked token hasn't already stolen it
   */
  keepingPolicy: HatComparisonPolicy;

  /**
   * Determines how Cursorless decides whether a token should steal a hat from a
   * lower ranked token
   */
  stealingPolicy: HatComparisonPolicy;
}

/**
 * Determines what equivalence class to use when deciding whether to keep or
 * steal a hat
 */
export enum HatComparisonPolicy {
  /**
   * Prefer hat quality above all else
   *
   * Equivalence class: (x) => x
   */
  greedy = "greedy",

  /**
   * Prefer hat quality unless the difference doesn't cross to next whole number
   *
   * Equivalence class: (x) => Math.floor(x)
   */
  floor = "floor",

  /**
   * Prefer hat quality unless both candidates are near the same whole number
   *
   * Equivalence class: (x) => Math.round(x)
   */
  round = "round",

  /**
   * Prefer hat quality only if it causes token's hat penalty to drop below 2
   *
   * Equivalence class: (x) => x < 2
   */
  threshold = "threshold",

  /**
   * Not greedy at all; for keepingPolicy will always keep hat if possible, for
   * stealingPolicy will never steal if possible
   *
   * Equivalence class: (x) => 0
   */
  stable = "stable",
}
