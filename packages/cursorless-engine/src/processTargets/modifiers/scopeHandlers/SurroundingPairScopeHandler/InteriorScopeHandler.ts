import {
  Range,
  type Direction,
  type InteriorScopeType,
  type Position,
  type ScopeType,
  type TextEditor,
} from "@cursorless/common";
import type { LanguageDefinitions } from "../../../../languages/LanguageDefinitions";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { FallbackScopeHandler } from "../FallbackScopeHandler";
import { OneOfScopeHandler } from "../OneOfScopeHandler";
import type { TargetScope } from "../scope.types";
import type {
  ComplexScopeType,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";
import { type ScopeHandler } from "../scopeHandler.types";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";

export class InteriorScopeHandler extends BaseScopeHandler {
  protected isHierarchical = true;
  private scopeHandler: ScopeHandler;

  get iterationScopeType(): ScopeType | ComplexScopeType {
    return this.scopeHandler.iterationScopeType;
  }

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    languageDefinitions: LanguageDefinitions,
    public scopeType: InteriorScopeType,
    private languageId: string,
  ) {
    super();

    this.scopeHandler = (() => {
      const languageScopeHandler = languageDefinitions
        .get(languageId)
        ?.getScopeHandler(this.scopeType);

      // If the scope type is explicit (ie, the user has specified a scope
      // type), then we don't want to include matching pairs. The user might
      // have said something like "inside element" and then we don't want to
      // yield `<div>`.
      if (scopeType.explicitScopeType) {
        if (languageScopeHandler == null) {
          return FallbackScopeHandler.createFromScopeHandlers([]);
        }
        return languageScopeHandler;
      }

      const pairInteriorScopeHandler = scopeHandlerFactory.create(
        {
          type: "surroundingPairInterior",
          delimiter: "any",
          allowWeakContainment: true,
        },
        languageId,
      );

      if (languageScopeHandler == null) {
        return pairInteriorScopeHandler;
      }

      return OneOfScopeHandler.createFromScopeHandlers(
        scopeHandlerFactory,
        {
          type: "oneOf",
          scopeTypes: [
            languageScopeHandler.scopeType,
            pairInteriorScopeHandler.scopeType!,
          ],
        },
        [languageScopeHandler, pairInteriorScopeHandler],
        languageId,
      );
    })();
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const scopes = this.scopeHandler.generateScopes(
      editor,
      position,
      direction,
      hints,
    );

    // The user haven specified an explicit scope types. Just yield all matching scopes.
    if (!this.scopeType.explicitScopeType) {
      yield* scopes;
    }

    const targetDomain = new Range(position, hints.distalPosition);

    // If the user has specified an explicit scope type, then we only want to
    // yield scopes that is contained within the target domain. For example if
    // the user said "inside token", then we don't want to yield scopes that are
    // larger than the token. The definition of an interior is that it's
    // inside the scope.
    for (const scope of scopes) {
      if (targetDomain.contains(scope.domain)) {
        yield scope;
      }
    }
  }
}
