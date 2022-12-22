/**
 * Options to configure the behavior of the input box UI.
 */
export interface InputBoxOptions {
  /**
   * An optional string that represents the title of the input box.
   */
  title?: string;

  /**
   * The value to prefill in the input box.
   */
  value?: string;

  /**
   * The text to display underneath the input box.
   */
  prompt?: string;

  /**
   * An optional string to show as placeholder in the input box to guide the user what to type.
   */
  placeHolder?: string;
}
