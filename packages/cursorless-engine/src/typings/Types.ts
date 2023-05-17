import type {
  Range,
  ReadOnlyHatMap,
  Selection,
  TextDocument,
  TextEditor,
} from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import { Target } from "./target.types";

export interface ProcessedTargetsContext {
  hatTokenMap: ReadOnlyHatMap;
  thatMark: Target[];
  sourceMark: Target[];
  getNodeAtLocation: (document: TextDocument, range: Range) => SyntaxNode;
}

export interface SelectionWithEditor {
  selection: Selection;
  editor: TextEditor;
}

export interface RangeWithEditor {
  range: Range;
  editor: TextEditor;
}

export interface SelectionContext {
  containingListDelimiter?: string;

  /**
   * Selection used for removal
   */
  removalRange?: Range;

  /**
   * The range used for the interior
   */
  interiorRange?: Range;

  /**
   * The range of the delimiter before the selection
   */
  leadingDelimiterRange?: Range;

  /**
   * The range of the delimiter after the selection
   */
  trailingDelimiterRange?: Range;
}

export type SelectionWithEditorWithContext = {
  selection: SelectionWithEditor;
  context: SelectionContext;
};

export interface SelectionWithContext {
  selection: Selection;
  context: SelectionContext;
}

export type NodeMatcherValue = {
  node: SyntaxNode;
  selection: SelectionWithContext;
};

export type NodeMatcherAlternative = NodeMatcher | string[] | string;

export type NodeMatcher = (
  selection: SelectionWithEditor,
  node: SyntaxNode,
) => NodeMatcherValue[] | null;

/**
 * Returns the desired relative of the provided node.
 * Returns null if matching node not found.
 **/
export type NodeFinder = (
  node: SyntaxNode,
  selection?: Selection,
) => SyntaxNode | null;

/** Returns one or more selections for a given SyntaxNode */
export type SelectionExtractor = (
  editor: TextEditor,
  nodes: SyntaxNode,
) => SelectionWithContext;

/** Represent a single edit/change in the document */
export interface Edit {
  range: Range;
  text: string;

  /**
   * If this edit is an insertion, ie the range has zero length, then this
   * field can be set to `true` to indicate that any adjacent empty selection
   * should *not* be shifted to the right, as would normally happen with an
   * insertion. This is equivalent to the
   * [distinction](https://code.visualstudio.com/api/references/vscode-api#TextEditorEdit)
   * in a vscode edit builder between doing a replace with an empty range
   * versus doing an insert.
   */
  isReplace?: boolean;
}

export interface EditWithRangeUpdater extends Edit {
  /**
   * This function will be passed the resulting range containing {@link text}
   * after applying the edit, and should return a new range which excludes any
   * delimiters that were inserted.
   */
  updateRange: (range: Range) => Range;
}
