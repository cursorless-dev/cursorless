import { NestedScopeHandler } from ".";
import { getMatcher } from "../../../core/tokenizer";
import { getMatchesInRange } from "../../../util/regex";
import { TokenTarget } from "../../targets";
import type { TargetScope } from "./scope.types";

export default class IdentifierScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "identifier" } as const;
  public readonly iterationScopeType = { type: "line" } as const;

  private regex: RegExp = getMatcher(this.languageId).identifierMatcher;

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
