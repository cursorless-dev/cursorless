import { imap } from "itertools";
import { NestedScopeHandler } from ".";
import { getMatcher } from "../../../core/tokenizer";
import type {
  Direction,
  ScopeType,
} from "../../../typings/targetDescriptor.types";
import { generateMatchesInRange, testRegex } from "../../../util/regex";
import { TokenTarget } from "../../targets";
import type { TargetScope } from "./scope.types";

export default class TokenScopeHandler extends NestedScopeHandler {
  public readonly scopeType: ScopeType = { type: "token" };
  public readonly iterationScopeType: ScopeType = { type: "line" };

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
        getTarget: (isReversed) =>
          new TokenTarget({
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
    const { identifierMatcher } = getMatcher(document.languageId);

    return testRegex(identifierMatcher, document.getText(scopeA.domain))
      ? true
      : testRegex(identifierMatcher, document.getText(scopeB.domain))
      ? false
      : undefined;
  }
}
