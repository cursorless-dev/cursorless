import type { Edit, Range, Selection, TextEditor } from "@cursorless/common";
import type { Node } from "web-tree-sitter";

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
  node: Node;
  selection: SelectionWithContext;
};

export type NodeMatcherAlternative = NodeMatcher | string[] | string;

export type NodeMatcher = (
  selection: SelectionWithEditor,
  node: Node,
) => NodeMatcherValue[] | null;

/**
 * Returns the desired relative of the provided node.
 * Returns null if matching node not found.
 **/
export type NodeFinder = (node: Node, selection?: Selection) => Node | null;

/** Returns one or more selections for a given Node */
export type SelectionExtractor = (
  editor: TextEditor,
  nodes: Node,
) => SelectionWithContext;

export interface EditWithRangeUpdater extends Edit {
  /**
   * This function will be passed the resulting range containing {@link text}
   * after applying the edit, and should return a new range which excludes any
   * delimiters that were inserted.
   */
  updateRange: (range: Range) => Range;
}
