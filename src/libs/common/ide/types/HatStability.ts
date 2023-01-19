export interface HatStability {
  keepingPolicy: HatComparisonPolicy;
  stealingPolicy: HatComparisonPolicy;
}

enum HatComparisonPolicy {
  /**
   * TODO: Change this
   * Only try to reuse an old hat when doing so wouldn't cause a token's hat
   * penalty to increase
   */
  greedy = "greedy",

  /**
   * TODO: Change this
   * Only try to reuse an old hat when doing so wouldn't cause a token's hat
   * penalty to cross the next whole number
   */
  floor = "floor",

  /**
   * TODO: Change this
   * Only try to reuse an old hat when doing so wouldn't cause a token's hat
   * penalty to go from <2 to >=2
   */
  round = "round",

  /**
   * TODO: Change this
   */
  threshold = "threshold",

  /**
   * TODO: Change this
   * Always reuse a token's old hat unless a token with a higher score
   * (determined by proximity to cursor) needs to steal the hat to get its
   * desired penalty
   */
  stable = "stable",
}
