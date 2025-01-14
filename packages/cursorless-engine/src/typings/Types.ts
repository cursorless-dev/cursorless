import type { Edit, Range, Selection, TextEditor } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";

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

export interface EditWithRangeUpdater extends Edit {
  /**
   * This function will be passed the resulting range containing {@link text}
   * after applying the edit, and should return a new range which excludes any
   * delimiters that were inserted.
   */
  updateRange: (range: Range) => Range;
}
