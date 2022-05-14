import { Location, Selection } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { getNodeMatcher } from "../../languages/getNodeMatcher";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../typings/target.types";
import {
  NodeMatcher,
  ProcessedTargetsContext,
  SelectionWithEditor,
  TypedSelection,
} from "../../typings/Types";
import { selectionWithEditorFromRange } from "../../util/selectionUtils";
import PipelineStage from "./PipelineStage";

export default class implements PipelineStage {
  run(
    context: ProcessedTargetsContext,
    stage: ContainingScopeModifier | EveryScopeModifier,
    selection: TypedSelection
  ): TypedSelection[] {
    const nodeMatcher = getNodeMatcher(
      selection.editor.document.languageId,
      stage.scopeType,
      stage.type === "everyScope"
    );
    const node: SyntaxNode | null = context.getNodeAtLocation(
      new Location(selection.editor.document.uri, selection.contentRange.start)
    );

    const result = findNearestContainingAncestorNode(node, nodeMatcher, {
      editor: selection.editor,
      selection: new Selection(
        selection.contentRange.start,
        selection.contentRange.end
      ),
    });

    if (result == null) {
      throw new Error(`Couldn't find containing ${stage.scopeType}`);
    }

    return result.map((selection) => ({
      editor: selection.selection.editor,
      contentRange: selection.selection.selection,
      removalRange: selection.context.outerSelection ?? undefined,
      delimiter: selection.context.containingListDelimiter ?? undefined,
      leadingDelimiterRange:
        selection.context.leadingDelimiterRange ?? undefined,
      trailingDelimiterRange:
        selection.context.trailingDelimiterRange ?? undefined,
    }));
  }
}

export function findNearestContainingAncestorNode(
  startNode: SyntaxNode,
  nodeMatcher: NodeMatcher,
  selection: SelectionWithEditor
) {
  let node: SyntaxNode | null = startNode;
  while (node != null) {
    const matches = nodeMatcher(selection, node);
    if (matches != null) {
      return matches
        .map((match) => match.selection)
        .map((matchedSelection) => ({
          selection: selectionWithEditorFromRange(
            selection,
            matchedSelection.selection
          ),
          context: matchedSelection.context,
        }));
    }
    node = node.parent;
  }

  return null;
}
