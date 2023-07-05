import {
  IterationScopeRangeConfig,
  IterationScopeRanges,
  ScopeRangeConfig,
  TextEditor,
} from "@cursorless/common";
import { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { ScopeHandlerFactory } from "../processTargets/modifiers/scopeHandlers/ScopeHandlerFactory";
import { getIterationRange } from "./getIterationRange";
import { getIterationScopes } from "./getIterationScopes";
import { getScopes } from "./getScopes";

export class ScopeRangeProvider {
  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.provideScopeRanges = this.provideScopeRanges.bind(this);
    this.provideIterationScopeRanges =
      this.provideIterationScopeRanges.bind(this);
  }

  provideScopeRanges(
    editor: TextEditor,
    { scopeType, visibleOnly }: ScopeRangeConfig,
  ) {
    const scopeHandler = this.scopeHandlerFactory.create(
      scopeType,
      editor.document.languageId,
    );

    if (scopeHandler == null) {
      return [];
    }

    return getScopes(
      editor,
      scopeHandler,
      getIterationRange(editor, scopeHandler, visibleOnly),
    );
  }

  provideIterationScopeRanges(
    editor: TextEditor,
    {
      scopeType,
      visibleOnly,
      includeNestedTargets: includeIterationNestedTargets,
    }: IterationScopeRangeConfig,
  ): IterationScopeRanges[] {
    const { languageId } = editor.document;
    const scopeHandler = this.scopeHandlerFactory.create(scopeType, languageId);

    if (scopeHandler == null) {
      return [];
    }

    const iterationScopeHandler = this.scopeHandlerFactory.create(
      scopeHandler.iterationScopeType,
      languageId,
    );

    if (iterationScopeHandler == null) {
      return [];
    }

    return getIterationScopes(
      editor,
      iterationScopeHandler,
      this.modifierStageFactory.create({
        type: "everyScope",
        scopeType,
      }),
      getIterationRange(editor, scopeHandler, visibleOnly),
      includeIterationNestedTargets,
    );
  }
}
