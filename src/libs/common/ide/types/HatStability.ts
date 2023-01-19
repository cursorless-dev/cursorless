export enum HatStability {
  /**
   * Only try to reuse an old hat when doing so wouldn't cause a token's hat
   * penalty to increase
   */
  low = 0,

  /**
   * Only try to reuse an old hat when doing so wouldn't cause a token's hat
   * penalty to cross the next whole number
   */
  lowRounded = 1,

  /**
   * Only try to reuse an old hat when doing so wouldn't cause a token's hat
   * penalty to go from <2 to >=2
   */
  lowThresholded = 2,

  /**
   * TODO: Document
   */
  thresholded = 3,

  /**
   * Always reuse a token's old hat unless a token with a higher score
   * (determined by proximity to cursor) needs to steal the hat to get its
   * desired penalty
   */
  high = 4,

  /**
   * Always reuse a token's old hat unless a token with a higher score
   * (determined by proximity to cursor) needs to steal the hat to get its
   * penalty below 2
   */
  highThresholded = 5,

  /**
   * Always reuse a token's old hat unless a token with a higher score
   * (determined by proximity to cursor) has no option but to steal a hat to get
   * a hat at all
   */
  higher = 6,

  /**
   * Never remove a hat from a token while the token remains visibl
   */
  strict = 7,
}
