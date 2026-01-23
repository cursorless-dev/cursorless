import type {
  Direction,
  Position,
  SurroundingPairScopeType,
  TextEditor,
} from "@cursorless/common";
import type { LanguageDefinitions } from "../../../../languages/LanguageDefinitions";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { compareTargetScopes } from "../compareTargetScopes";
import type { TargetScope } from "../scope.types";
import type {
  ConditionalScopeType,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";
import { createTargetScope } from "./createTargetScope";
import { getDelimiterOccurrences } from "./getDelimiterOccurrences";
import { getIndividualDelimiters } from "./getIndividualDelimiters";
import { getSurroundingPairOccurrences } from "./getSurroundingPairOccurrences";
import type { SurroundingPairOccurrence } from "./types";
import { scopeHandlerCache } from "../ScopeHandlerCache";

export class SurroundingPairScopeHandler extends BaseScopeHandler {
  public readonly iterationScopeType: ConditionalScopeType = {
    type: "conditional",
    scopeType: { type: "line" },
    predicate: (scope) => !scope.domain.isEmpty,
  };
  protected isHierarchical = true;

  constructor(
    private languageDefinitions: LanguageDefinitions,
    public readonly scopeType: SurroundingPairScopeType,
    private languageId: string,
  ) {
    super();
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const cacheKey = "SurroundingPairScopeHandler_" + this.scopeType.delimiter;

    if (!scopeHandlerCache.isValid(cacheKey, editor.document)) {
      const delimiterOccurrences = getDelimiterOccurrences(
        this.languageDefinitions.get(this.languageId),
        editor.document,
        getIndividualDelimiters(this.scopeType.delimiter, this.languageId),
      );

      const surroundingPairs =
        getSurroundingPairOccurrences(delimiterOccurrences);

      scopeHandlerCache.update(cacheKey, editor.document, surroundingPairs);
    }

    const surroundingPairs = scopeHandlerCache.get<SurroundingPairOccurrence>();

    const updatedSurroundingPairs = maybeApplyEmptyTargetHack(
      direction,
      hints,
      position,
      surroundingPairs,
    );

    yield* updatedSurroundingPairs
      .map((pair) =>
        createTargetScope(
          editor,
          pair,
          this.scopeType.requireStrongContainment ?? false,
        ),
      )
      .sort((a, b) => compareTargetScopes(direction, position, a, b));
  }
}

/**
 * Applies the empty target hack, if appropriate. We are trying to detect that
 * we are in a situation where the target is empty and the user has asked for
 * containing scope. We use this so that in the case of `(()|)`, "take pair"
 * yields the bigger pair, to be consistent with the way VSCode highlights the
 * pair adjacent to your cursor.
 *
 * FIXME: This is a hack. We're basically using a heuristic to guess that we're
 * being called from containing scope stage with empty target, but we really
 * can't assume this.
 */
function maybeApplyEmptyTargetHack(
  direction: Direction,
  hints: ScopeIteratorRequirements,
  position: Position,
  surroundingPairs: SurroundingPairOccurrence[],
): SurroundingPairOccurrence[] {
  if (
    direction === "forward" &&
    hints.containment === "required" &&
    hints.allowAdjacentScopes &&
    hints.skipAncestorScopes
  ) {
    return surroundingPairs.filter(
      (pair, i) =>
        !(
          pair.closingDelimiterRange.end.isEqual(position) &&
          surroundingPairs[i + 1]?.closingDelimiterRange.start.isEqual(position)
        ),
    );
  }

  return surroundingPairs;
}
