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
import { selectionWithEditorFromRange } from "../../../util/selectionUtils";
import { ModifierStage } from "../../PipelineStages.types";
import { getTokenContext } from "./TokenStage";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): ScopeTypeTarget[] {
    const nodeMatcher = getNodeMatcher(
      target.editor.document.languageId,
      this.modifier.scopeType,
      this.modifier.type === "everyScope"
    );
    const node: SyntaxNode | null = context.getNodeAtLocation(
      new Location(target.editor.document.uri, target.contentRange)
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

    // TODO Re enable when all the containing scopes have proper delimiters
    // return scopeNodes.map((scope) => ({
    //   scopeType: this.modifier.scopeType,
    //   editor: target.editor,
    //   isReversed: target.isReversed,
    //   contentRange: scope.selection.selection,
    //   interiorRange: scope.context.interior,
    //   removalRange: scope.context.removalRange,
    //   delimiter: scope.context.containingListDelimiter ?? "\n",
    //   boundary: scope.context.boundary,
    //   leadingDelimiterRange: scope.context.leadingDelimiterRange,
    //   trailingDelimiterRange: scope.context.trailingDelimiterRange,
    // }));

    // For now fall back on token
    return scopeNodes.map((scope) => {
      const newTarget = {
        scopeType: this.modifier.scopeType,
        editor: target.editor,
        isReversed: target.isReversed,
        contentRange: scope.selection.selection,
        interiorRange: scope.context.interior,
        removalRange: scope.context.removalRange,
        delimiter: scope.context.containingListDelimiter,
        boundary: scope.context.boundary,
        leadingDelimiterRange: scope.context.leadingDelimiterRange,
        trailingDelimiterRange: scope.context.trailingDelimiterRange,
      };
      const tokenContext = useTokenContext(newTarget)
        ? getTokenContext(newTarget)
        : undefined;
      return {
        ...newTarget,
        delimiter: newTarget.delimiter ?? tokenContext?.delimiter ?? "\n",
        leadingDelimiterRange:
          newTarget.leadingDelimiterRange ??
          tokenContext?.leadingDelimiterRange,
        trailingDelimiterRange:
          newTarget.trailingDelimiterRange ??
          tokenContext?.trailingDelimiterRange,
      };
    });
  }
}

function useTokenContext(target: Target) {
  return (
    target.delimiter == null &&
    target.leadingDelimiterRange == null &&
    target.trailingDelimiterRange == null
  );
}

function findNearestContainingAncestorNode(
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
