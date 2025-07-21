import type { Range, TextDocument } from "@cursorless/common";
import type { Node } from "web-tree-sitter";

/**
 * A capture of a query pattern against a syntax tree.  Often corresponds to a
 * node within the syntax tree, but can also be a range within a node or be modified
 * by query predicate operators.
 */
export interface QueryCapture {
  /**
   * The name of the capture.  Eg for a capture labeled `@foo`, the name is
   * `foo`.
   */
  readonly name: string;

  /** The range of the capture. */
  readonly range: Range;

  /** Whether it is ok for the same capture to appear multiple times with the
   * same domain. If set to `true`, then the scope handler should merge all
   * captures with the same name and domain into a single scope with multiple
   * content ranges. */
  readonly allowMultiple: boolean;

  /** The insertion delimiter to use if any */
  readonly insertionDelimiter: string | undefined;

  /** Returns true if this node or any of its ancestors has errors */
  hasError(): boolean;
}

/**
 * A match of a query pattern against a syntax tree.
 */
export interface QueryMatch {
  /**
   * The captures of the pattern that was matched.
   */
  readonly captures: QueryCapture[];
}

/**
 * A capture of a query pattern against a syntax tree. This type is used
 * internally by the query engine to allow operators to modify the capture.
 */
export interface MutableQueryCapture extends QueryCapture {
  /**
   * The tree-sitter node that was captured.
   * This may be undefined if the range has been modified by a query predicate.
   */
  node: Node | undefined;

  readonly document: TextDocument;
  range: Range;
  allowMultiple: boolean;
  insertionDelimiter: string | undefined;
}

/**
 * A match of a query pattern against a syntax tree that can be mutated. This
 * type is used internally by the query engine to allow operators to modify the
 * match.
 */
export interface MutableQueryMatch extends QueryMatch {
  /**
   * The index of the pattern that was matched.
   */
  readonly patternIdx: number;

  readonly captures: MutableQueryCapture[];
}
