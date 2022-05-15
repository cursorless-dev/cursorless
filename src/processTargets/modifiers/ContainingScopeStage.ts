import { Location, Selection } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { getNodeMatcher } from "../../languages/getNodeMatcher";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
  Target,
} from "../../typings/target.types";
import {
  NodeMatcher,
  ProcessedTargetsContext,
  SelectionWithEditor,
} from "../../typings/Types";
import { selectionWithEditorFromRange } from "../../util/selectionUtils";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const nodeMatcher = getNodeMatcher(
      target.editor.document.languageId,
      this.modifier.scopeType,
      this.modifier.type === "everyScope"
    );
    const node: SyntaxNode | null = context.getNodeAtLocation(
      new Location(target.editor.document.uri, target.contentRange.start)
    );

    const scopeNodes = findNearestContainingAncestorNode(node, nodeMatcher, {
      editor: target.editor,
      selection: new Selection(
        target.contentRange.start,
        target.contentRange.end
      ),
    });

    if (scopeNodes == null) {
      throw new Error(`Couldn't find containing ${this.modifier.scopeType}`);
    }

    return scopeNodes.map((scope) => ({
      isReversed: target.isReversed,
      editor: scope.selection.editor,
      contentRange: scope.selection.selection,
      interiorRange: scope.context.interior?.at(0)?.selection,
      removalRange: scope.context.outerSelection ?? undefined,
      isNotebookCell: scope.context.isNotebookCell,
      delimiter: scope.context.containingListDelimiter ?? undefined,
      boundary: scope.context.boundary?.map((bound) => bound.selection),
      leadingDelimiterRange: scope.context.leadingDelimiterRange ?? undefined,
      trailingDelimiterRange: scope.context.trailingDelimiterRange ?? undefined,
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
