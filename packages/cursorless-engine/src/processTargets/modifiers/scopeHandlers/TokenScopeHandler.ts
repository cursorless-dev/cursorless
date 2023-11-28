import { imap } from "itertools";
import { NestedScopeHandler } from ".";
import { generateMatchesInRange } from "../../../util/getMatchesInRange";
import { Direction } from "@cursorless/common";
import { getMatcher } from "../../../tokenizer";
import { testRegex } from "../../../util/regex";
import { TokenTarget } from "../../targets";
import type { TargetScope } from "./scope.types";

const PREFERRED_SYMBOLS_REGEX = /[$]/;

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
    const {
      editor: { document },
    } = scopeA;
    const { identifierMatcher } = getMatcher(this.languageId);

    const textA = document.getText(scopeA.domain);
    const textB = document.getText(scopeB.domain);

    // Regexes indicating preferences.  We prefer identifiers then preferred
    // symbols.
    const matchers = [identifierMatcher, PREFERRED_SYMBOLS_REGEX];

    for (const matcher of matchers) {
      // NB: Don't directly use `test` here because global regexes are stateful
      // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
      const aMatchesRegex = testRegex(matcher, textA);
      const bMatchesRegex = testRegex(matcher, textB);

      if (aMatchesRegex && !bMatchesRegex) {
        return true;
      }

      if (bMatchesRegex && !aMatchesRegex) {
        return false;
      }
    }

    return undefined;
  }
}
