import { imap } from "itertools";
import { NestedScopeHandler } from ".";
import { generateMatchesInRange } from "../../../util/getMatchesInRange";
import { Direction, ScopeType } from "@cursorless/common";
import { getMatcher } from "../../../tokenizer";
import { testRegex } from "../../../util/regex";
import { PlainTarget } from "../../targets";
import type { TargetScope } from "./scope.types";

/**
 * The regex used to split a range into characters.  Combines letters with their
 * diacritics, and combines `\r\n` into one character.  Otherwise just looks for
 * simple characters.
 */
const SPLIT_REGEX = /\p{L}\p{M}*|[\p{N}\p{P}\p{S}\p{Z}\p{C}]/gu;

const NONWHITESPACE_REGEX = /\p{L}\p{M}*|[\p{N}\p{P}\p{S}]/gu;

export default class CharacterScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "character" } as const;
  public readonly iterationScopeType = { type: "token" } as const;

  protected get searchScopeType(): ScopeType {
    return { type: "line" };
  }

  protected generateScopesInSearchScope(
    direction: Direction,
    { editor, domain }: TargetScope,
  ): Iterable<TargetScope> {
    return imap(
      generateMatchesInRange(SPLIT_REGEX, editor, domain, direction),
      (range) => ({
        editor,
        domain: range,
        getTarget: (isReversed) =>
          new PlainTarget({
            editor,
            contentRange: range,
            isReversed,
            isToken: false,
          }),
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

    const aText = document.getText(scopeA.domain);
    const bText = document.getText(scopeB.domain);

    // Regexes indicating preferences.  We prefer identifiers, then
    // nonwhitespace.
    const matchers = [identifierMatcher, NONWHITESPACE_REGEX];

    for (const matcher of matchers) {
      // NB: Don't directly use `test` here because global regexes are stateful
      // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
      const aMatchesRegex = testRegex(matcher, aText);
      const bMatchesRegex = testRegex(matcher, bText);

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
