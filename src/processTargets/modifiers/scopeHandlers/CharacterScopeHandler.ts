import { imap } from "itertools";
import { generateMatchesInRange } from "../../../apps/cursorless-vscode/getMatchesInRange";
import { getMatcher } from "../../../libs/cursorless-engine/tokenizer";
import { testRegex } from "../../../libs/cursorless-engine/util/regex";
import { Direction, ScopeType } from "../../../typings/targetDescriptor.types";
import { PlainTarget } from "../../targets";
import NestedScopeHandler from "./NestedScopeHandler";
import type { TargetScope } from "./scope.types";

/**
 * The regex used to split a range into characters.  Combines letters with their
 * diacritics, and combines `\r\n` into one character.  Otherwise just looks for
 * simple characters.
 */
const SPLIT_REGEX = /\p{L}\p{M}*|\r?\n|[\p{N}\p{P}\p{S}\p{Z}\p{C}]/gu;

const NONWHITESPACE_REGEX = /\p{L}\p{M}*|[\p{N}\p{P}\p{S}]/gu;

/**
 * Matches whitespace, but not newlines
 */
const WHITESPACE_REGEX = /\p{Z}/gu;

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
    const range = editor.document.lineAt(
      domain.start.line,
    ).rangeIncludingLineBreak;

    return imap(
      generateMatchesInRange(SPLIT_REGEX, editor, range, direction),
      (range) => ({
        editor,
        domain: range,
        getTarget: (isReversed) =>
          new PlainTarget({
            editor,
            contentRange: range,
            isReversed,
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
    // nonwhitespace, then whitespace but not newline.  We only pick newlines as
    // a last resort.
    const matchers = [identifierMatcher, NONWHITESPACE_REGEX, WHITESPACE_REGEX];

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
