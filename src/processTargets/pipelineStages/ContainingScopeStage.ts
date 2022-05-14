import { Location, Selection } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { getNodeMatcher } from "../../languages/getNodeMatcher";
import { ContainingScopeModifier } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { findNearestContainingAncestorNode } from "../modifiers/processModifier";
import PipelineStage from "./PipelineStage";

export default class implements PipelineStage {
  run(
    context: ProcessedTargetsContext,
    stage: ContainingScopeModifier,
    selection: TypedSelection
  ): TypedSelection[] {
    const nodeMatcher = getNodeMatcher(
      selection.editor.document.languageId,
      stage.scopeType,
      stage.includeSiblings ?? false
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
