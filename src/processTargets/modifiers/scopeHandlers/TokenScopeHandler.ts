import { NestedScopeHandler } from ".";
import { getMatcher } from "../../../core/tokenizer";
import type { ScopeType } from "../../../typings/targetDescriptor.types";
import { getTokensInRange } from "../../../util/getTokensInRange";
import { testRegex } from "../../../util/regex";
import { TokenTarget } from "../../targets";
import type { TargetScope } from "./scope.types";

export default class TokenScopeHandler extends NestedScopeHandler {
  public readonly scopeType: ScopeType = { type: "token" };
  public readonly iterationScopeType: ScopeType = { type: "line" };

  private idRegex: RegExp = getMatcher(this.languageId).identifierMatcher;

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
      // Prefer this scope if it's an identifier and the alternative is not.
      isPreferred: (scope2: TargetScope) =>
        testRegex(this.idRegex, editor.document.getText(range)) &&
        !testRegex(this.idRegex, editor.document.getText(scope2.domain)),
    }));
  }
}
