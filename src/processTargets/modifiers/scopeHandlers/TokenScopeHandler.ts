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

    return identifierMatcher.test(document.getText(scopeA.domain))
      ? true
      : identifierMatcher.test(document.getText(scopeB.domain))
      ? false
      : undefined;
  }
}
