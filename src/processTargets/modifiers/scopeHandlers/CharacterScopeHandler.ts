import { imap } from "itertools";
import { NestedScopeHandler } from ".";
import { GRAPHEME_SPLIT_REGEX } from "../../../core/TokenGraphemeSplitter";
import { Direction } from "../../../typings/targetDescriptor.types";
import { generateMatchesInRange } from "../../../util/regex";
import { PlainTarget } from "../../targets";
import type { TargetScope } from "./scope.types";

export default class CharacterScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "character" } as const;
  public readonly iterationScopeType = { type: "token" } as const;

  protected generateScopesInSearchScope(
    direction: Direction,
    { editor, domain }: TargetScope,
  ): Iterable<TargetScope> {
    return imap(
      generateMatchesInRange(GRAPHEME_SPLIT_REGEX, editor, domain, direction),
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
