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

      if (scopeType.languageDefinitionOnly) {
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

    if (!this.scopeType.languageDefinitionOnly) {
      yield* scopes;
    }

    const domain = new Range(position, hints.distalPosition);

    for (const scope of scopes) {
      if (domain.contains(scope.domain)) {
        yield scope;
      }
    }
  }
}
