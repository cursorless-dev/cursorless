import { NestedScopeHandler } from ".";
import { getMatcher } from "../../../core/tokenizer";
import type { ScopeType } from "../../../typings/targetDescriptor.types";
import { getMatchesInRange } from "../../../util/regex";
import { TokenTarget } from "../../targets";
import type { TargetScope } from "./scope.types";

export default class IdentifierScopeHandler extends NestedScopeHandler {
  public readonly scopeType: ScopeType = { type: "identifier" };
  public readonly iterationScopeType: ScopeType = { type: "line" };

  private regex: RegExp;

  constructor(languageId: string) {
    super(languageId);
    this.regex = getMatcher(languageId).identifierMatcher;
  }

  protected getScopesInIterationScope({
    editor,
    domain,
  }: TargetScope): TargetScope[] {
    return getMatchesInRange(this.regex, editor, domain).map((range) => ({
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
}
