import type {
  Direction,
  Position,
  ScopeType,
  TextEditor,
} from "@cursorless/common";
import type { LanguageDefinitions } from "../../../../languages/LanguageDefinitions";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { OneOfScopeHandler } from "../OneOfScopeHandler";
import type { TargetScope } from "../scope.types";
import type {
  CustomScopeType,
  ScopeHandler,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";
import { CollectionItemTextualScopeHandler } from "./CollectionItemTextualScopeHandler";

export class CollectionItemScopeHandler extends BaseScopeHandler {
  public scopeType: ScopeType = { type: "collectionItem" };
  protected isHierarchical = true;
  private scopeHandler: ScopeHandler;

  get iterationScopeType(): ScopeType | CustomScopeType {
    return this.scopeHandler.iterationScopeType;
  }

  constructor(
    scopeHandlerFactory: ScopeHandlerFactory,
    languageDefinitions: LanguageDefinitions,
    languageId: string,
  ) {
    super();

    this.scopeHandler = (() => {
      const textualScopeHandler = new CollectionItemTextualScopeHandler(
        scopeHandlerFactory,
        languageId,
      );

      const languageScopeHandler = languageDefinitions
        .get(languageId)
        ?.getScopeHandler(this.scopeType);

      if (languageScopeHandler == null) {
        return textualScopeHandler;
      }

      return OneOfScopeHandler.createFromScopeHandlers(
        scopeHandlerFactory,
        {
          type: "oneOf",
          scopeTypes: [
            textualScopeHandler.scopeType,
            languageScopeHandler.scopeType,
          ],
        },
        [textualScopeHandler, languageScopeHandler],
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
