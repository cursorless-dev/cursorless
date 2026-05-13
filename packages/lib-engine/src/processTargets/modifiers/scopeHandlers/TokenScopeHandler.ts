import { imap } from "itertools";
import type { Direction, IDE, ScopeType } from "@cursorless/lib-common";
import { getMatcher } from "../../../tokenizer";
import { generateMatchesInRange } from "../../../util/getMatchesInRange";
import { TokenTarget } from "../../targets";
import { isPreferredOverHelper } from "./isPreferredOverHelper";
import { NestedScopeHandler } from "./NestedScopeHandler";
import type { TargetScope } from "./scope.types";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";

const PREFERRED_SYMBOLS_REGEX = /[$]/gu;

export class TokenScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "token" } as const;
  public readonly iterationScopeType = { type: "line" } as const;
  private regex: RegExp;

  constructor(
    private ide: IDE,
    scopeHandlerFactory: ScopeHandlerFactory,
    scopeType: ScopeType,
    languageId: string,
  ) {
    super(scopeHandlerFactory, scopeType, languageId);
    this.regex = getMatcher(ide, this.languageId).tokenMatcher;
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

  isPreferredOver(
    scopeA: TargetScope,
    scopeB: TargetScope,
  ): boolean | undefined {
    const { identifierMatcher } = getMatcher(this.ide, this.languageId);
    // Regexes indicating preferences. We prefer identifiers then preferred
    // symbols.
    return isPreferredOverHelper(scopeA, scopeB, [
      identifierMatcher,
      PREFERRED_SYMBOLS_REGEX,
    ]);
  }
}
