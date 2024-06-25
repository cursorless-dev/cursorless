import { Direction, ScopeType } from "@cursorless/common";
import { imap } from "itertools";
import { NestedScopeHandler } from "./NestedScopeHandler";
import { getMatcher } from "../../../tokenizer";
import { generateMatchesInRange } from "../../../util/getMatchesInRange";
import { PlainTarget } from "../../targets";
import { isPreferredOverHelper } from "./isPreferredOverHelper";
import type { TargetScope } from "./scope.types";

/**
 * The regex used to split a range into characters.  Combines letters with their
 * diacritics, and combines `\r\n` into one character.  Otherwise just looks for
 * simple characters.
 */
const SPLIT_REGEX = /\p{L}\p{M}*|[\p{N}\p{P}\p{S}\p{Z}\p{C}]/gu;

const PREFERRED_SYMBOLS_REGEX = /[$]/g;
const NONWHITESPACE_REGEX = /\p{L}\p{M}*|[\p{N}\p{P}\p{S}]/gu;

export class CharacterScopeHandler extends NestedScopeHandler {
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
        getTargets: (isReversed) => [
          new PlainTarget({
            editor,
            contentRange: range,
            isReversed,
            isToken: false,
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
    // Regexes indicating preferences. We prefer identifiers, preferred
    // symbols, then nonwhitespace.
    return isPreferredOverHelper(scopeA, scopeB, [
      identifierMatcher,
      PREFERRED_SYMBOLS_REGEX,
      NONWHITESPACE_REGEX,
    ]);
  }
}
