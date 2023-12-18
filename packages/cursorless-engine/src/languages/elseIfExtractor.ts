import { Selection, TextEditor } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import { SelectionExtractor, SelectionWithContext } from "../typings/Types";
import {
  childRangeSelector,
  positionFromPoint,
  simpleSelectionExtractor,
} from "../util/nodeSelectors";

/**
 * Returns an extractor that can be used to extract `else if` branches in languages
 * with C-like structure, where the `if` portion of an `else if` structure is
 * structurally just an arbitrary statement that happens to be an `if`
 * statement.
 * @returns An extractor that will exctract `else if` branches
 */
export function elseIfExtractor(): SelectionExtractor {
  /**
   * This extractor pulls out `if (foo) {}` from `if (foo) {} else {}`, ie it
   * excludes any child `else` statement if it exists.  It will be used as the
   * content range, but the removal range will want to include a leading or
   * trailing `else` keyword if one exists.
   */
  const contentRangeExtractor = childRangeSelector(["else_clause"], [], {
    includeUnnamedChildren: true,
  });

  return function (editor: TextEditor, node: SyntaxNode): SelectionWithContext {
    const contentRange = contentRangeExtractor(editor, node);

    const parent = node.parent;
    if (parent?.type !== "else_clause") {
      // We have no leading `else` clause; ie we are a standalone `if`
      // statement.  We may still have our own `else` child, but we are not
      // ourselves a branch of a bigger `if` statement.
      const alternative = node.childForFieldName("alternative");

      if (alternative == null) {
        // If we have no nested else clause, and are not part of an else clause
        // ourself, then we don't need to remove any leading / trailing `else`
        // keyword
        return contentRange;
      }

      // Otherwise, we have no leading `else`, but we do have our own nested
      // `else` clause, so we want to remove its `else` keyword
      const { selection } = contentRange;
      return {
        selection,
        context: {
          removalRange: new Selection(
            selection.start,
            positionFromPoint(alternative.namedChild(0)!.startPosition),
          ),
        },
      };
    }

    // If we get here, we are part of a bigger `if` statement; extend our
    // content range past our leading `else` keyword.
    const { selection } = contentRange;
    return {
      selection: new Selection(
        positionFromPoint(parent.child(0)!.startPosition),
        selection.end,
      ),
      context: {},
    };
  };
}

/**
 * Returns an extractor that can be used to extract `else` branches in languages
 * with C-like structure, where the `if` portion of an `else if` structure is
 * structurally just an arbitrary statement that happens to be an `if`
 * statement.
 * @param ifNodeType The node type for `if` statements
 * @returns An extractor that will exctract `else` branches
 */
export function elseExtractor(ifNodeType: string): SelectionExtractor {
  const nestedElseIfExtractor = elseIfExtractor();

  return function (editor: TextEditor, node: SyntaxNode): SelectionWithContext {
    // If we are an `else if` statement, then we just run `elseIfExtractor` on
    // our nested `if` node.  Otherwise we are a simple `else` branch and don't
    // need to do anything fancy.
    return node.namedChild(0)!.type === ifNodeType
      ? nestedElseIfExtractor(editor, node.namedChild(0)!)
      : simpleSelectionExtractor(editor, node);
  };
}
