import { NestedScopeHandler } from ".";
import { GRAPHEME_SPLIT_REGEX } from "../../../core/TokenGraphemeSplitter";
import { getMatcher } from "../../../core/tokenizer";
import { getMatchesInRange } from "../../../util/regex";
import { PlainTarget } from "../../targets";
import { preferRegexCallback } from "../getPreferredScope";
import type { TargetScope } from "./scope.types";

export default class CharacterScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "character" } as const;
  public readonly iterationScopeType = { type: "token" } as const;

  private idRegex: RegExp = getMatcher(this.languageId).identifierMatcher;

  protected getScopesInSearchScope({
    editor,
    domain,
  }: TargetScope): TargetScope[] {
    return getMatchesInRange(GRAPHEME_SPLIT_REGEX, editor, domain).map(
      (range) => ({
        editor,
        domain: range,
        getTarget: (isReversed) =>
          new PlainTarget({
            editor,
            contentRange: range,
            isReversed,
          }),
        // Prefer this scope if it's an identifier and the alternative is not.
        isPreferred: (scope2: TargetScope) =>
          preferRegexCallback(this.idRegex, editor, range, scope2.domain),
      }),
    );
  }
}
