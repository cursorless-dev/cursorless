import type { TextDocument, Range } from "../..";

/**
 * An event describing a transactional {@link TextDocument document} change.
 */
export interface TextDocumentChangeEvent {
  /**
   * The affected document.
   */
  readonly document: TextDocument;

  /**
   * An array of content changes.
   */
  readonly contentChanges: readonly TextDocumentContentChangeEvent[];

  /**
   * The reason why the document was changed.
   * Is undefined if the reason is not known.
   */
  readonly reason?: TextDocumentChangeReason;
}

/**
 * An event describing an individual change in the text of a {@link TextDocument document}.
 */
export interface TextDocumentContentChangeEvent {
  /**
   * The range that got replaced.
   */
  readonly range: Range;

  /**
   * The offset of the range that got replaced.
   */
  readonly rangeOffset: number;

  /**
   * The length of the range that got replaced.
   */
  readonly rangeLength: number;

  /**
   * The new text for the range.
   */
  readonly text: string;
}

export type TextDocumentChangeReason = "undo" | "redo";
