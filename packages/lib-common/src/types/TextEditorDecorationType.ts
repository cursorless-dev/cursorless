/**
 * Represents a handle to a set of decorations sharing the same
 * {@link DecorationRenderOptions styling options}.
 */
export interface TextEditorDecorationType {
  /**
   * Internal representation of the handle.
   */
  readonly key: string;

  /**
   * this decoration type and all decorations on all text editors using it.
   */
  dispose(): void;
}
