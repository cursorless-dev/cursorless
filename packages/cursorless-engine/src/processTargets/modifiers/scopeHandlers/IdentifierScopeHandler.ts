import { imap } from "itertools";
import { NestedScopeHandler } from ".";
import { getMatcher } from "../../../tokenizer";
import type { Direction } from "@cursorless/common";
import { generateMatchesInRange } from "../../../util/getMatchesInRange";
import { TokenTarget } from "../../targets";
import type { TargetScope } from "./scope.types";

export default class IdentifierScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "identifier" } as const;
  public readonly iterationScopeType = { type: "line" } as const;

  private regex: RegExp = getMatcher(this.languageId).identifierMatcher;

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
}
