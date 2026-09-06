import { imap } from "itertools";
import { escapeRegExp } from "lodash-es";
import type {
  CustomRegexScopeType,
  Direction,
  GlyphScopeType,
  ScopeType,
} from "@cursorless/lib-common";
import { generateMatchesInRange } from "../../../util/getMatchesInRange";
import { TokenTarget } from "../../targets";
import { NestedScopeHandler } from "./NestedScopeHandler";
import type { TargetScope } from "./scope.types";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";

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
  regex = /\S+/gu;
}

export class UrlScopeHandler extends RegexStageBase {
  // taken from https://regexr.com/3e6m0
  regex =
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gu;

  // oxlint-disable-next-line no-useless-constructor
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
    return new RegExp(this.scopeType.regex, this.scopeType.flags ?? "gu");
  }

  // oxlint-disable-next-line no-useless-constructor
  constructor(
    scopeHandlerFactory: ScopeHandlerFactory,
    readonly scopeType: CustomRegexScopeType,
    languageId: string,
  ) {
    super(scopeHandlerFactory, scopeType, languageId);
  }
}

export class GlyphScopeHandler extends RegexStageBase {
  get regex() {
    return new RegExp(escapeRegExp(this.scopeType.character), "gui");
  }

  // oxlint-disable-next-line no-useless-constructor
  constructor(
    scopeHandlerFactory: ScopeHandlerFactory,
    readonly scopeType: GlyphScopeType,
    languageId: string,
  ) {
    super(scopeHandlerFactory, scopeType, languageId);
  }
}
