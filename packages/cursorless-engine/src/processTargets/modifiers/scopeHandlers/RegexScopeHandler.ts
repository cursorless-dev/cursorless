import type {
  CustomRegexScopeType,
  Direction,
  ScopeType,
} from "@cursorless/common";
import { imap } from "itertools";
import type { ScopeHandlerFactory } from ".";
import { NestedScopeHandler } from ".";
import { generateMatchesInRange } from "../../../util/getMatchesInRange";
import { TokenTarget } from "../../targets";
import type { TargetScope } from "./scope.types";

abstract class RegexStageBase extends NestedScopeHandler {
  public readonly iterationScopeType: ScopeType = { type: "line" };
  protected abstract readonly regex: RegExp;

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

export class NonWhitespaceSequenceScopeHandler extends RegexStageBase {
  regex = /\S+/g;
}

export class UrlScopeHandler extends RegexStageBase {
  // taken from https://regexr.com/3e6m0
  regex =
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;

  constructor(
    scopeHandlerFactory: ScopeHandlerFactory,
    readonly scopeType: ScopeType,
    languageId: string,
  ) {
    super(scopeHandlerFactory, scopeType, languageId);
  }
}

export class CustomRegexScopeHandler extends RegexStageBase {
  get regex() {
    return new RegExp(this.scopeType.regex, "gu");
  }

  constructor(
    scopeHandlerFactory: ScopeHandlerFactory,
    readonly scopeType: CustomRegexScopeType,
    languageId: string,
  ) {
    super(scopeHandlerFactory, scopeType, languageId);
  }
}
