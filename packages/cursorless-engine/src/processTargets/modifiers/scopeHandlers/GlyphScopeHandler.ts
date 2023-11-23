import { Direction, GlyphScopeType } from "@cursorless/common";
import { imap } from "itertools";
import { NestedScopeHandler, ScopeHandlerFactory } from ".";
import { generateMatchesInRange } from "../../../util/getMatchesInRange";
import { PlainTarget } from "../../targets";
import type { TargetScope } from "./scope.types";
import { escapeRegExp } from "lodash";

export class GlyphScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "glyph", character: "" } as const;
  public readonly iterationScopeType = { type: "document" } as const;
  private readonly regex: RegExp;

  constructor(
    scopeHandlerFactory: ScopeHandlerFactory,
    scopeType: GlyphScopeType,
    languageId: string,
  ) {
    super(scopeHandlerFactory, scopeType, languageId);
    this.regex = new RegExp(escapeRegExp(scopeType.character), "g");
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
          new PlainTarget({
            editor,
            contentRange: range,
            isReversed,
          }),
        ],
      }),
    );
  }
}
