import {
  Direction,
  Position,
  TextDocument,
  TextEditor,
  showError,
} from "@cursorless/common";
import { uniqWith } from "lodash";
import { TreeSitterQuery } from "../../../../languages/TreeSitterQuery";
import { QueryMatch } from "../../../../languages/TreeSitterQuery/QueryCapture";
import BaseScopeHandler from "../BaseScopeHandler";
import { compareTargetScopes } from "../compareTargetScopes";
import { TargetScope } from "../scope.types";
import {
  ContainmentPolicy,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";
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
}

/**
 * Constructs a range to pass to {@link Query.matches} to find scopes. Note
 * that {@link Query.matches} will only return scopes that have non-empty
 * intersection with this range.  Also note that the base
 * {@link BaseScopeHandler.generateScopes} will filter out any extra scopes
 * that we yield, so we don't need to be totally precise.
 *
 * @returns Range to pass to {@link Query.matches}
 */
function getQuerySearchRange(
  document: TextDocument,
  position: Position,
  direction: Direction,
  {
    containment,
    distalPosition,
    allowAdjacentScopes,
  }: ScopeIteratorRequirements,
) {
  const { start, end } = getQuerySearchRangeCore(
    document.offsetAt(position),
    document.offsetAt(distalPosition),
    direction,
    containment,
    allowAdjacentScopes,
  );

  return {
    start: document.positionAt(start),
    end: document.positionAt(end),
  };
}

/** Helper function for {@link getQuerySearchRange} */
function getQuerySearchRangeCore(
  offset: number,
  distalOffset: number,
  direction: Direction,
  containment: ContainmentPolicy | null,
  allowAdjacentScopes: boolean,
) {
  /**
   * If we allow adjacent scopes, we need to shift some of our offsets by one
   * character
   */
  const adjacentShift = allowAdjacentScopes ? 1 : 0;

  if (containment === "required") {
    // If containment is required, we smear the position left and right by one
    // character so that we have a non-empty intersection with any scope that
    // touches position.  Note that we can skip shifting the initial position
    // if we disallow adjacent scopes.
    return direction === "forward"
      ? {
          start: offset - adjacentShift,
          end: offset + 1,
        }
      : {
          start: offset - 1,
          end: offset + adjacentShift,
        };
  }

  // If containment is disallowed, we can shift the position forward by a
  // character to avoid matching scopes that touch position.  Otherwise, we
  // shift the position backward by a character to ensure we get scopes that
  // touch position, if we allow adjacent scopes.
  const proximalShift = containment === "disallowed" ? 1 : -adjacentShift;

  // FIXME: Don't go all the way to end of document when there is no
  // distalPosition? Seems wasteful to query all the way to end of document for
  // something like "next funk" Might be better to start smaller and
  // exponentially grow
  return direction === "forward"
    ? {
        start: offset + proximalShift,
        end: distalOffset + adjacentShift,
      }
    : {
        start: distalOffset - adjacentShift,
        end: offset - proximalShift,
      };
}
