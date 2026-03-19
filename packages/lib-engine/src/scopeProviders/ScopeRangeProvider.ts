import type {
  IterationScopeRangeConfig,
  IterationScopeRanges,
  ScopeRangeConfig,
  ScopeRanges,
  ScopeType,
  TextEditor,
} from "@cursorless/common";
import { Range } from "@cursorless/common";
import type { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import type { ScopeHandlerFactory } from "../processTargets/modifiers/scopeHandlers/ScopeHandlerFactory";
import { getIterationRange } from "./getIterationRange";
import { getIterationScopeRanges } from "./getIterationScopeRanges";
import { getScopeRanges } from "./getScopeRanges";

/**
 * Provides scope ranges for a given editor to use eg for visualizing scopes
 */
export class ScopeRangeProvider {
  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.provideScopeRanges = this.provideScopeRanges.bind(this);
    this.provideScopeRangesForRange =
      this.provideScopeRangesForRange.bind(this);
    this.provideIterationScopeRanges =
      this.provideIterationScopeRanges.bind(this);
  }

  provideScopeRanges(
    editor: TextEditor,
    { scopeType, visibleOnly }: ScopeRangeConfig,
  ): ScopeRanges[] {
    const scopeHandler = this.scopeHandlerFactory.maybeCreate(
      scopeType,
      editor.document.languageId,
    );

    if (scopeHandler == null) {
      return [];
    }

    return getScopeRanges(
      editor,
      scopeHandler,
      getIterationRange(editor, scopeHandler, visibleOnly),
    );
  }

  provideScopeRangesForRange(
    editor: TextEditor,
    scopeType: ScopeType,
    range: Range,
  ): ScopeRanges[] {
    const scopeHandler = this.scopeHandlerFactory.maybeCreate(
      scopeType,
      editor.document.languageId,
    );

    if (scopeHandler == null) {
      return [];
    }

    // Need to have a non empty intersection with the scopes
    if (range.isEmpty) {
      const offset = editor.document.offsetAt(range.start);
      range = new Range(
        editor.document.positionAt(offset - 1),
        editor.document.positionAt(offset + 1),
      );
    }

    return getScopeRanges(editor, scopeHandler, range);
  }

  provideIterationScopeRanges(
    editor: TextEditor,
    { scopeType, visibleOnly, includeNestedTargets }: IterationScopeRangeConfig,
  ): IterationScopeRanges[] {
    const { languageId } = editor.document;
    const scopeHandler = this.scopeHandlerFactory.maybeCreate(
      scopeType,
      languageId,
    );

    if (scopeHandler == null) {
      return [];
    }

    const iterationScopeHandler = this.scopeHandlerFactory.maybeCreate(
      scopeHandler.iterationScopeType,
      languageId,
    );

    if (iterationScopeHandler == null) {
      return [];
    }

    return getIterationScopeRanges(
      editor,
      iterationScopeHandler,
      this.modifierStageFactory.create({
        type: "everyScope",
        scopeType,
      }),
      getIterationRange(editor, scopeHandler, visibleOnly),
      includeNestedTargets,
    );
  }
}
