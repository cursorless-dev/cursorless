import type {
  ContainingScopeModifier,
  EveryScopeModifier,
  SimpleScopeType,
} from "@cursorless/common";
import { NoContainingScopeError, Selection } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import { LanguageDefinitions } from "../../../languages/LanguageDefinitions";
import { getNodeMatcher } from "../../../languages/getNodeMatcher";
import type {
  NodeMatcher,
  SelectionWithEditor,
  SelectionWithEditorWithContext,
} from "../../../typings/Types";
import type { Target } from "../../../typings/target.types";
import { selectionWithEditorFromRange } from "../../../util/selectionUtils";
import type { ModifierStage } from "../../PipelineStages.types";
import { ScopeTypeTarget } from "../../targets";

export interface SimpleContainingScopeModifier extends ContainingScopeModifier {
  scopeType: SimpleScopeType;
}

export interface SimpleEveryScopeModifier extends EveryScopeModifier {
  scopeType: SimpleScopeType;
}

export class LegacyContainingSyntaxScopeStage implements ModifierStage {
  constructor(
    private languageDefinitions: LanguageDefinitions,
    private modifier: SimpleContainingScopeModifier | SimpleEveryScopeModifier,
  ) {}

  async run(target: Target): Promise<ScopeTypeTarget[]> {
    const nodeMatcher = getNodeMatcher(
      target.editor.document.languageId,
      this.modifier.scopeType.type,
      this.modifier.type === "everyScope",
    );

    const node: SyntaxNode | null = this.languageDefinitions.getNodeAtLocation(
      target.editor.document,
      target.contentRange,
    );

    const scopeNodes = findNearestContainingAncestorNode(node, nodeMatcher, {
      editor: target.editor,
      selection: new Selection(
        target.contentRange.start,
        target.contentRange.end,
      ),
    });

    if (scopeNodes == null) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    return scopeNodes.map((scope) => {
      const {
        containingListDelimiter,
        leadingDelimiterRange,
        trailingDelimiterRange,
        removalRange,
        interiorRange,
      } = scope.context;

      if (
        removalRange != null &&
        (leadingDelimiterRange != null || trailingDelimiterRange != null)
      ) {
        throw Error(
          "Removal range is mutually exclusive with leading or trailing delimiter range",
        );
      }

      const { editor, selection: contentSelection } = scope.selection;

      return new ScopeTypeTarget({
        scopeTypeType: this.modifier.scopeType.type,
        editor,
        isReversed: target.isReversed,
        contentRange: contentSelection,
        removalRange: removalRange,
        interiorRange: interiorRange,
        insertionDelimiter: containingListDelimiter,
        leadingDelimiterRange,
        trailingDelimiterRange,
      });
    });
  }
}

function findNearestContainingAncestorNode(
  startNode: SyntaxNode,
  nodeMatcher: NodeMatcher,
  selection: SelectionWithEditor,
): SelectionWithEditorWithContext[] | null {
  let node: SyntaxNode | null = startNode;
  while (node != null) {
    const matches = nodeMatcher(selection, node);
    if (matches != null) {
      return matches
        .map((match) => match.selection)
        .map((matchedSelection) => ({
          selection: selectionWithEditorFromRange(
            selection,
            matchedSelection.selection,
          ),
          context: matchedSelection.context,
        }));
    }
    node = node.parent;
  }

  return null;
}
