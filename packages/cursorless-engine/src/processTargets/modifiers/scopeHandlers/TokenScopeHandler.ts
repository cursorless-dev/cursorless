import { imap } from "itertools";
import { NestedScopeHandler } from ".";
import { generateMatchesInRange } from "../../../util/getMatchesInRange";
import { Direction } from "@cursorless/common";
import { getMatcher } from "../../../tokenizer";
import { testRegex } from "../../../util/regex";
import { TokenTarget } from "../../targets";
import type { TargetScope } from "./scope.types";

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
    const { identifierMatcher } = getMatcher(document.languageId);

    const textA = document.getText(scopeA.domain);
    const textB = document.getText(scopeB.domain);

    return (
      // First check for identifiers
      isPreferredOver(textA, textB, (text) =>
        // NB: Don't directly use `test` here because global regexes are stateful
        // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
        testRegex(identifierMatcher, text),
      ) ??
      // Then check for dollar signs
      isPreferredOver(textA, textB, (text) => text === "$")
    );
  }
}

function isPreferredOver(
  textA: string,
  textB: string,
  matcher: (text: string) => boolean,
): boolean | undefined {
  const matchesA = matcher(textA);
  const matchesB = matcher(textB);

  if (matchesA && !matchesB) {
    return true;
  }

  if (!matchesA && matchesB) {
    return false;
  }

  return undefined;
}
