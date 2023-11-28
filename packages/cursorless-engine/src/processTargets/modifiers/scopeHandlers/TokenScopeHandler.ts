import { Direction } from "@cursorless/common";
import { imap } from "itertools";
import { NestedScopeHandler } from ".";
import { getMatcher } from "../../../tokenizer";
import { generateMatchesInRange } from "../../../util/getMatchesInRange";
import { TokenTarget } from "../../targets";
import { isPreferredOverHelper } from "./isPreferredOverHelper";
import type { TargetScope } from "./scope.types";

const PREFERRED_SYMBOLS_REGEX = /[$]/g;

export class TokenScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "token" } as const;
  public readonly iterationScopeType = { type: "line" } as const;

  private regex: RegExp = getMatcher(this.languageId).tokenMatcher;

  protected generateScopesInSearchScope(
    direction: Direction,
    { editor, domain }: TargetScope,
  ): Iterable<TargetScope> {
    return imap(
      generateMatchesInRange(this.regex, editor, domain, direction),
      (range) => ({
        editor,
        domain: range,
        getTargets: (isReversed) => [
          new TokenTarget({
            editor,
            contentRange: range,
            isReversed,
          }),
        ],
      }),
    );
  }

  isPreferredOver(
    scopeA: TargetScope,
    scopeB: TargetScope,
  ): boolean | undefined {
    const { identifierMatcher } = getMatcher(this.languageId);
    // Regexes indicating preferences. We prefer identifiers then preferred
    // symbols.
    return isPreferredOverHelper(scopeA, scopeB, [
      identifierMatcher,
      PREFERRED_SYMBOLS_REGEX,
    ]);
  }
}
