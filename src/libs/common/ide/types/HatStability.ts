/**
 * Determines what equivalence class to use when deciding whether to keep or
 * steal a hat
 */
export enum HatStability {
  /**
   * Only consider hats whose penalty is just as good as the best candidate hat.
   * This setting will result in less stable hats, but ensure that tokens near
   * the cursor always get the best hats hat.
   *
   * Equivalence class: (x) => x
   */
  greedy = "greedy",

  /**
   * If the best candidate hat has a penalty below 2 (eg it is a gray shape or
   * colored dot), then discard all hats whose penalty is 2 or greater. This
   * setting results in fairly stable hats, while ensuring that all tokens near
   * the cursor have a penalty less than 2.
   *
   * Equivalence class: (x) => x < 2
   */
  balanced = "balanced",

  /**
   * Don't discard any hats. Always use existing hat if it wasn't stolen, and
   * don't steal hats unless there are no free hats left to this token. Note
   * that if you don't have shapes enabled, then this setting is equivalent to
   * `balanced`.
   *
   * Equivalence class: (x) => 0
   */
  stable = "stable",
}
