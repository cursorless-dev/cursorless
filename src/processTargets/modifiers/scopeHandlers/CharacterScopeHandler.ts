import { NestedScopeHandler } from ".";
import { GRAPHEME_SPLIT_REGEX } from "../../../core/TokenGraphemeSplitter";
import { getMatchesInRange } from "../../../util/regex";
import { PlainTarget } from "../../targets";
import type { TargetScope } from "./scope.types";

export default class CharacterScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "character" } as const;
  public readonly iterationScopeType = { type: "token" } as const;

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
      }),
    );
  }
}
