import { Selection, TextEditor } from "@cursorless/common";
import { SyntaxNode } from "web-tree-sitter";
import { SelectionExtractor, SelectionWithContext } from "../typings/Types";
import {
  childRangeSelector,
  positionFromPoint,
  simpleSelectionExtractor,
} from "../util/nodeSelectors";

export function elseIfExtractor(): SelectionExtractor {
  const contentRangeExtractor = childRangeSelector(["else_clause"], [], {
    includeUnnamedChildren: true,
  });

  return function (editor: TextEditor, node: SyntaxNode): SelectionWithContext {
    const contentRange = contentRangeExtractor(editor, node);

    const parent = node.parent;
    if (parent?.type !== "else_clause") {
      const alternative = node.childForFieldName("alternative");

      if (alternative == null) {
        return contentRange;
      }

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

    const { selection } = contentRange;
    return {
      selection,
      context: {
        removalRange: new Selection(
          positionFromPoint(parent.child(0)!.startPosition),
          selection.end,
        ),
      },
    };
  };
}
export function elseExtractor(ifNodeType: string): SelectionExtractor {
  const nestedElseIfExtractor = elseIfExtractor();

  return function (editor: TextEditor, node: SyntaxNode): SelectionWithContext {
    return node.namedChild(0)!.type === ifNodeType
      ? nestedElseIfExtractor(editor, node.namedChild(0)!)
      : simpleSelectionExtractor(editor, node);
  };
}
