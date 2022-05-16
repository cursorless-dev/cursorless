import { Location, Selection } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { getNodeMatcher } from "../../../languages/getNodeMatcher";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
  ScopeTypeTarget,
  Target,
} from "../../../typings/target.types";
import {
  NodeMatcher,
  ProcessedTargetsContext,
  SelectionWithEditor,
} from "../../../typings/Types";
import {
  isReversed,
  selectionWithEditorFromRange,
} from "../../../util/selectionUtils";
import { ModifierStage } from "../../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): ScopeTypeTarget[] {
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
      scopeType: this.modifier.scopeType,
      editor: scope.selection.editor,
      isReversed: isReversed(scope.selection.selection),
      contentRange: scope.selection.selection,
      interiorRange: scope.context.interior,
      removalRange: scope.context.removalRange,
      delimiter: scope.context.containingListDelimiter,
      boundary: scope.context.boundary,
      leadingDelimiterRange: scope.context.leadingDelimiterRange,
      trailingDelimiterRange: scope.context.trailingDelimiterRange,
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
