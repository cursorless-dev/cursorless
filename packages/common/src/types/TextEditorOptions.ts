/**
 * Represents a {@link TextEditor text editor}'s {@link TextEditor.options options}.
 */
export interface TextEditorOptions {
  /**
   * The size in spaces a tab takes. This is used for two purposes:
   *  - the rendering width of a tab character;
   *  - the number of spaces to insert when {@link TextEditorOptions.insertSpaces insertSpaces} is true.
   *
   * When getting a text editor's options, this property will always be a number (resolved).
   * When setting a text editor's options, this property is optional and it can be a number or `"auto"`.
   */
  tabSize?: number | string;

  /**
   * When pressing Tab insert {@link TextEditorOptions.tabSize n} spaces.
   * When getting a text editor's options, this property will always be a boolean (resolved).
   * When setting a text editor's options, this property is optional and it can be a boolean or `"auto"`.
   */
  insertSpaces?: boolean | string;
}
