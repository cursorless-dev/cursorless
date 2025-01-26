import {
  type Direction,
  type Position,
  type ScopeType,
  type SimpleScopeType,
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
  public scopeType: ScopeType = { type: "interior" };
  protected isHierarchical = true;
  private scopeHandler: ScopeHandler;

  get iterationScopeType(): ScopeType | ComplexScopeType {
    return this.scopeHandler.iterationScopeType;
  }

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    languageDefinitions: LanguageDefinitions,
    scopeType: SimpleScopeType,
    private languageId: string,
  ) {
    super();

    this.scopeHandler = (() => {
      const pairInteriorScopeHandler = scopeHandlerFactory.create(
        {
          type: "surroundingPairInterior",
          delimiter: "any",
          allowWeakContainment: true,
        },
        languageId,
      );

      const languageScopeHandler = languageDefinitions
        .get(languageId)
        ?.getScopeHandler(this.scopeType);

      if (languageScopeHandler == null) {
        return pairInteriorScopeHandler;
      }

      if (scopeType.type === "interiorFallback") {
        return FallbackScopeHandler.createFromScopeHandlers([
          languageScopeHandler,
          pairInteriorScopeHandler,
        ]);
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

  generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    return this.scopeHandler.generateScopes(editor, position, direction, hints);
  }
}
