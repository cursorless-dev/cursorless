import type { Direction, Position, TextEditor } from "@cursorless/common";
import { showError } from "@cursorless/common";
import { uniqWith } from "lodash-es";
import type { TreeSitterQuery } from "../../../../languages/TreeSitterQuery";
import type { QueryMatch } from "../../../../languages/TreeSitterQuery/QueryCapture";
import { ide } from "../../../../singletons/ide.singleton";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { compareTargetScopes } from "../compareTargetScopes";
import type { TargetScope } from "../scope.types";
import type { ScopeIteratorRequirements } from "../scopeHandler.types";
import { isHintsEveryScope } from "../util/isHintsEveryScope";
import { getQuerySearchRange } from "./getQuerySearchRange";
import { mergeAdjacentBy } from "./mergeAdjacentBy";

/** Base scope handler to use for both tree-sitter scopes and their iteration scopes */
export abstract class BaseTreeSitterScopeHandler extends BaseScopeHandler {
  constructor(protected query: TreeSitterQuery) {
    super();
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const { document } = editor;
    const isEveryScope = isHintsEveryScope(hints);

    /** Narrow the range within which tree-sitter searches, for performance */
    const { start, end } = getQuerySearchRange(
      document,
      position,
      direction,
      hints,
    );

    const scopes = this.query
      .matches(document, start, end)
      .map((match) => this.matchToScope(editor, match, isEveryScope))
      .filter((scope): scope is ExtendedTargetScope => scope != null)
      .sort((a, b) => compareTargetScopes(direction, position, a, b));

    // Merge scopes that have the same domain into a single scope with multiple
    // targets
    yield* mergeAdjacentBy(
      scopes,
      (a, b) => a.domain.isRangeEqual(b.domain),
      (equivalentScopes) => {
        if (equivalentScopes.length === 1) {
          return equivalentScopes[0];
        }

        return {
          ...equivalentScopes[0],

          getTargets(isReversed: boolean) {
            const targets = uniqWith(
              equivalentScopes.flatMap((scope) => scope.getTargets(isReversed)),
              (a, b) => a.isEqual(b),
            );

            if (
              targets.length > 1 &&
              !equivalentScopes.every((scope) => scope.allowMultiple)
            ) {
              const message =
                "Please use #allow-multiple! predicate in your query to allow multiple matches for this scope type";

              void showError(
                ide().messages,
                "BaseTreeSitterScopeHandler.allow-multiple",
                message,
              );

              if (ide().runMode === "test") {
                throw Error(message);
              }
            }

            return targets;
          },
        };
      },
    );
  }

  /**
   * Convert a tree-sitter match to a scope, or undefined if the match is not
   * relevant to this scope handler
   * @param editor The editor in which the match was found
   * @param match The match to convert to a scope
   * @param isEveryScope Whether the scope is being used in an "every" modifier
   * @returns The scope, or undefined if the match is not relevant to this scope
   * handler
   */
  protected abstract matchToScope(
    editor: TextEditor,
    match: QueryMatch,
    isEveryScope: boolean,
  ): ExtendedTargetScope | undefined;
}

export interface ExtendedTargetScope extends TargetScope {
  allowMultiple: boolean;
}
