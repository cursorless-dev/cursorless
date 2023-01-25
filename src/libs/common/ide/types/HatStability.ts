/**
 * Determines what equivalence class to use when deciding whether to keep or
 * steal a hat
 */
export enum HatStability {
  /**
   * Prefer hat quality above all else
   *
   * Equivalence class: (x) => x
   */
  greedy = "greedy",

  /**
   * Prefer hat quality only if it causes token's hat penalty to drop below 2
   *
   * Equivalence class: (x) => x < 2
   */
  balanced = "balanced",

  /**
   * Not greedy at all; will always keep hat if possible, and will avoid
   * stealing if possible
   *
   * Equivalence class: (x) => 0
   */
  stable = "stable",
}
