import {
  type Direction,
  type IDE,
  type Position,
  type ScopeType,
  type TextEditor,
} from "@cursorless/common";
import type { LanguageDefinitions } from "../../../languages/LanguageDefinitions";
import { BaseScopeHandler } from "./BaseScopeHandler";
import { NotebookCellApiScopeHandler } from "./NotebookCellApiScopeHandler";
import type { TargetScope } from "./scope.types";
import type {
  ComplexScopeType,
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";
import { SortedScopeHandler } from "./SortedScopeHandler";

export class NotebookCellScopeHandler extends BaseScopeHandler {
  public readonly scopeType = { type: "notebookCell" } as const;
  protected isHierarchical = false;
  private readonly scopeHandler: ScopeHandler;

  get iterationScopeType(): ScopeType | ComplexScopeType {
    return this.scopeHandler.iterationScopeType;
  }

  constructor(
    ide: IDE,
    scopeHandlerFactory: ScopeHandlerFactory,
    languageDefinitions: LanguageDefinitions,
    _scopeType: ScopeType,
    languageId: string,
  ) {
    super();

    this.scopeHandler = (() => {
      const apiScopeHandler = new NotebookCellApiScopeHandler(ide);

      const languageScopeHandler = languageDefinitions
        .get(languageId)
        ?.getScopeHandler(this.scopeType);

      if (languageScopeHandler == null) {
        return apiScopeHandler;
      }

      return SortedScopeHandler.createFromScopeHandlers(
        scopeHandlerFactory,
        languageId,
        [languageScopeHandler, apiScopeHandler],
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
