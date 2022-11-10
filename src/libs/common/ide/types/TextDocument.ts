import type { URI } from "vscode-uri";
import type Range from "./Range";

export default interface TextDocument {
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
   * The end of line sequence that is predominately
   * used in this document.
   */
  readonly eol: "LF" | "CRLF";

  /**
   * The range of the text document.
   */
  readonly range: Range;
}
