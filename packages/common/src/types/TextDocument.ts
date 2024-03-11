import type { URI } from "vscode-uri";
import type { EndOfLine, Position, Range, TextLine } from "..";

export interface TextDocument {
  /**
   * The associated uri for this document.
   *
   * *Note* that most documents use the `file`-scheme, which means they are files on disk. However, **not** all documents are
   * saved on disk and therefore the `scheme` must be checked before trying to access the underlying file or siblings on disk.
   */
  readonly uri: URI;

  /**
   * The identifier of the language associated with this document.
   */
  readonly languageId: string;

  /**
   * The version number of this document (it will strictly increase after each
   * change, including undo/redo).
   */
  readonly version: number;

  /**
   * The number of lines in this document.
   */
  readonly lineCount: number;

  /**
   * The range of the text document.
   */
  readonly range: Range;

  /**
   * The {@link EndOfLine end of line} sequence that is predominately
   * used in this document.
   */
  readonly eol: EndOfLine;

  /**
   * Returns a text line denoted by the line number. Note
   * that the returned object is *not* live and changes to the
   * document are not reflected.
   *
   * @param line A line number in [0, lineCount).
   * @return A {@link TextLine line}.
   */
  lineAt(line: number): TextLine;

  /**
   * Returns a text line denoted by the position. Note
   * that the returned object is *not* live and changes to the
   * document are not reflected.
   *
   * The position will be adjusted if it is outside {@link range}.
   *
   * @see {@link TextDocument.lineAt}
   *
   * @param position A position.
   * @return A {@link TextLine line}.
   */
  lineAt(position: Position): TextLine;

  /**
   * Converts the position to a zero-based offset.
   *
   * The position will be adjusted if it is outside {@link range}.
   *
   * @param position A position.
   * @return A valid zero-based offset.
   */
  offsetAt(position: Position): number;

  /**
   * Converts a zero-based offset to a position.
   *
   * @param offset A zero-based offset.
   * @return A valid {@link Position}.
   */
  positionAt(offset: number): Position;

  /**
   * Get the text of this document. A substring can be retrieved by providing
   * a range.
   *
   * The range will be adjusted if it extends outside {@link TextDocument.range}.
   *
   * @param range Include only the text included by the range.
   * @return The text inside the provided range or the entire text.
   */
  getText(range?: Range): Promise<string>;
}
