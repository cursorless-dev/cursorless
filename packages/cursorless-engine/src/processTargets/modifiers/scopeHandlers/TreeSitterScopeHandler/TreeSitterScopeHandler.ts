import {
  Direction,
  NoContainingScopeError,
  Position,
  ScopeType,
  Selection,
  SimpleScopeType,
  TextEditor,
} from "@cursorless/common";
import {
  NodeMatcher,
  ProcessedTargetsContext,
} from "../../../../typings/Types";
import { Target } from "../../../../typings/target.types";

import { selectionWithEditorFromRange } from "../../../../util/selectionUtils";
import ScopeTypeTarget from "../../../targets/ScopeTypeTarget";
import { TargetScope } from "../scope.types";
import { ScopeHandler } from "../scopeHandler.types";
import { getQueryNodeMatcher } from "./queryNodeMatchers";

/**
 * Handles scopes that are implemented using tree-sitter.
 */
export default class TreeSitterScopeHandler implements ScopeHandler {
  constructor(scopeType: ScopeType, private languageId: string) {}

  scopeType: SimpleScopeType;
  iterationScopeType: ScopeType;

  generateScopesRelativeToPosition(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints?: ScopeIteratorHints | undefined,
  ): Iterable<TargetScope> {
    throw new Error("Method not implemented.");
  }

  run(context: ProcessedTargetsContext, target: Target): ScopeTypeTarget[] {
    // TODO: Delete this function.  It should probably be refactored into some
    // common functions that are called by both `getScopeContainingPosition`
    // and `getEveryScope`
    const languageId = target.editor.document.languageId;
    const { type: scopeTypeType } = this.scopeType;
    const queryNodeMatcher = getQueryNodeMatcher(languageId, scopeTypeType)!;
    const scopeNodes = this.runQueryBasedNodeMatcher(
      queryNodeMatcher,
      context,
      target,
    );

    if (scopeNodes == null) {
      throw new NoContainingScopeError(scopeTypeType);
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
        scopeTypeType,
        editor,
        isReversed: target.isReversed,
        contentRange: contentSelection,
        removalRange: removalRange,
        delimiter: containingListDelimiter,
        interiorRange,
        leadingDelimiterRange,
        trailingDelimiterRange,
      });
    });
  }

  private runQueryBasedNodeMatcher(
    queryNodeMatcher: NodeMatcher,
    context: ProcessedTargetsContext,
    target: Target,
  ) {
    const selectionWithEditor = getSelectionWithEditor(target);

    const matchResult = queryNodeMatcher(
      selectionWithEditor,
      context.getTree(selectionWithEditor.editor.document),
      this.modifier.type === "everyScope",
    );

    return matchResult
      ? matchResult.map((match) => ({
          selection: selectionWithEditorFromRange(
            selectionWithEditor,
            match.selection.selection,
          ),
          context: match.selection.context,
        }))
      : null;
  }
}

function getSelectionWithEditor(target: Target) {
  return {
    editor: target.editor,
    selection: new Selection(
      target.contentRange.start,
      target.contentRange.end,
    ),
  };
}

export function maybeGetTreeSitterScopeHandler(
  scopeType: ScopeType,
  languageId: string,
): TreeSitterScopeHandler | undefined {
  const queryNodeMatcher = getQueryNodeMatcher(languageId, scopeType.type);
  if (queryNodeMatcher != null) {
    return new TreeSitterScopeHandler(queryNodeMatcher);
  }

  return undefined;
}
