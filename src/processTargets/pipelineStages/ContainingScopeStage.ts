import { Location } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { getNodeMatcher } from "../../languages/getNodeMatcher";
import {
  ContainingScopeModifier,
  SurroundingPairModifier,
} from "../../typings/target.types";
import {
  ProcessedTargetsContext,
  SelectionWithEditor,
  TypedSelection,
} from "../../typings/Types";
import {
  SelectionWithEditorWithContext,
  findNearestContainingAncestorNode,
} from "../modifiers/processModifier";
import PipelineStage from "./PipelineStage";
import TokenStage from "./TokenStage";

export default class implements PipelineStage {
  run(
    context: ProcessedTargetsContext,
    stage: ContainingScopeModifier,
    selection: TypedSelection
  ): TypedSelection {
    switch (stage.scopeType) {
      case "token":
        // TODO better solution?
        return new TokenStage().run(context, stage, selection);
      //   return processToken(target, selection, selectionContext);
      case "notebookCell":
      //   return processNotebookCell(target, selection, selectionContext);
      case "document":
      //   return processDocument(target, selection, selectionContext);
      case "line":
      //   return processLine(target, selection, selectionContext);
      case "paragraph":
      //   return processParagraph(target, selection, selectionContext);
      case "nonWhitespaceSequence":
      //   return processRegexDefinedScope(
      //     /\S+/g,
      //     target,
      //     selection,
      //     selectionContext
      //   );
      case "url":
      //   return processRegexDefinedScope(
      //     URL_REGEX,
      //     target,
      //     selection,
      //     selectionContext
      //   );

      default:
        syntaxBased(context);
    }
  }
}

function syntaxBased(
  context: ProcessedTargetsContext,
  selection: SelectionWithEditor,
  modifier: ContainingScopeModifier
): SelectionWithEditorWithContext[] | null {
  const nodeMatcher = getNodeMatcher(
    selection.editor.document.languageId,
    modifier.scopeType,
    modifier.includeSiblings ?? false
  );
  const node: SyntaxNode | null = context.getNodeAtLocation(
    new Location(selection.editor.document.uri, selection.selection)
  );

  const result = findNearestContainingAncestorNode(
    node,
    nodeMatcher,
    selection
  );

  if (result == null) {
    throw new Error(`Couldn't find containing ${modifier.scopeType}`);
  }

  return result;
}
