import type { Direction, IDE, ScopeType } from "@cursorless/lib-common";
import { imap } from "itertools";
import { getMatcher } from "../../../tokenizer";
import { generateMatchesInRange } from "../../../util/getMatchesInRange";
import { TokenTarget } from "../../targets";
import { NestedScopeHandler } from "./NestedScopeHandler";
import type { TargetScope } from "./scope.types";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";

export class IdentifierScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "identifier" } as const;
  public readonly iterationScopeType = { type: "line" } as const;
  private regex: RegExp;

  constructor(
    private ide: IDE,
    scopeHandlerFactory: ScopeHandlerFactory,
    scopeType: ScopeType,
    languageId: string,
  ) {
    super(scopeHandlerFactory, scopeType, languageId);
    this.regex = getMatcher(ide, this.languageId).identifierMatcher;
  }

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
