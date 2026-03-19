export interface Context {
  /** Whether we're deploying the final extension */
  isDeploy: boolean;

  /**
   * If `true`, then we override the extension id in order to install the
   * extension locally without new Cursorless version releases clobbering it.
   */
  isForLocalInstall: boolean;

  /** Whether we're running in CI */
  isCi: boolean;
}
