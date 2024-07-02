import { Direction, Position, TextEditor, showError } from "@cursorless/common";
import { uniqWith } from "lodash";
import { TreeSitterQuery } from "../../../../languages/TreeSitterQuery";
import { QueryMatch } from "../../../../languages/TreeSitterQuery/QueryCapture";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { compareTargetScopes } from "../compareTargetScopes";
import { TargetScope } from "../scope.types";
import { ScopeIteratorRequirements } from "../scopeHandler.types";
import { mergeAdjacentBy } from "./mergeAdjacentBy";
import { ide } from "../../../../singletons/ide.singleton";

/** Base scope handler to use for both tree-sitter scopes and their iteration scopes */
export abstract class BaseTreeSitterScopeHandler extends BaseScopeHandler {
  constructor(protected query: TreeSitterQuery) {
    super();
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    _hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const { document } = editor;

    // Due to a tree-sitter bug, we generate all scopes from the entire file
    // instead of using `_hints` to restrict the search range to scopes we care
    // about. The actual scopes yielded to the client are filtered by
    // `BaseScopeHandler` anyway, so there's no impact on correctness, just
    // performance. We'd like to roll this back; see #1769.

    const scopes = this.query
      .matches(document)
      .map((match) => this.matchToScope(editor, match))
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

              showError(
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
   * @returns The scope, or undefined if the match is not relevant to this scope
   * handler
   */
  protected abstract matchToScope(
    editor: TextEditor,
    match: QueryMatch,
  ): ExtendedTargetScope | undefined;
}

export interface ExtendedTargetScope extends TargetScope {
  allowMultiple: boolean;
  contiguous: boolean;
}
