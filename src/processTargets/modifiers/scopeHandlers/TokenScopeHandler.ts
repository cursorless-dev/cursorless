import { NestedScopeHandler } from ".";
import { getMatcher } from "../../../core/tokenizer";
import type { ScopeType } from "../../../typings/targetDescriptor.types";
import { getTokensInRange } from "../../../util/getTokensInRange";
import { TokenTarget } from "../../targets";
import type { TargetScope } from "./scope.types";

export default class TokenScopeHandler extends NestedScopeHandler {
  public readonly scopeType: ScopeType = { type: "token" };
  public readonly iterationScopeType: ScopeType = { type: "line" };

  protected getScopesInSearchScope({
    editor,
    domain,
  }: TargetScope): TargetScope[] {
    return getTokensInRange(editor, domain).map(({ range }) => ({
      editor,
      domain: range,
      getTarget: (isReversed) =>
        new TokenTarget({
          editor,
          contentRange: range,
          isReversed,
        }),
    }));
  }

  isPreferredOver(
    scopeA: TargetScope,
    scopeB: TargetScope,
  ): boolean | undefined {
    const {
      editor: { document },
    } = scopeA;

    const { identifierMatcher } = getMatcher(document.languageId);

    // If multiple matches sort and take the first
    const textA = document.getText(scopeA.domain);
    const textB = document.getText(scopeB.domain);

    // First sort on identifier(alphanumeric)
    const aIsAlphaNum = identifierMatcher.test(textA);
    const bIsAlphaNum = identifierMatcher.test(textB);

    if (aIsAlphaNum && !bIsAlphaNum) {
      return true;
    }

    if (bIsAlphaNum && !aIsAlphaNum) {
      return false;
    }

    // Second sort on length
    const lengthDiff = textA.length - textB.length;
    if (lengthDiff !== 0) {
      return lengthDiff > 0 ? true : false;
    }

    // Otherwise no preference
    return undefined;
  }
}
