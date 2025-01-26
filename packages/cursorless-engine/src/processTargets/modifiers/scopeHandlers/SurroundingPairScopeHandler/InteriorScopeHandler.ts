import type {
  Direction,
  Position,
  ScopeType,
  SimpleScopeType,
  TextEditor,
} from "@cursorless/common";
import type { LanguageDefinitions } from "../../../../languages/LanguageDefinitions";
import { BaseScopeHandler } from "../BaseScopeHandler";
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
    scopeHandlerFactory: ScopeHandlerFactory,
    languageDefinitions: LanguageDefinitions,
    _scopeType: SimpleScopeType,
    languageId: string,
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
