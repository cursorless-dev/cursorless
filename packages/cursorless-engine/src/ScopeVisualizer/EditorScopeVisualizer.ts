import {
  Disposable,
  IterationScopeRanges,
  Range,
  TextEditor,
} from "@cursorless/common";
import { ScopeVisualizerConfig } from "../CursorlessEngine.1";
import { Debouncer } from "../core/Debouncer";
import { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { ScopeHandlerFactory } from "../processTargets/modifiers/scopeHandlers/ScopeHandlerFactory";
import { ScopeHandler } from "../processTargets/modifiers/scopeHandlers/scopeHandler.types";
import { ide } from "../singletons/ide.singleton";
import { UnsupportedScopeTypeVisualizationError } from "./UnsupportedScopeTypeVisualizationError";
import { checkNonNull } from "./checkNonNull";
import { getIterationRange } from "./getIterationRange";
import { getIterationScopes } from "./getIterationScopes";
import { getScopes } from "./getScopes";

export class EditorScopeVisualizer implements Disposable {
  private disposables: Disposable[] = [];
  private debouncer = new Debouncer(() => this.highlightScopes());

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifierStageFactory: ModifierStageFactory,
    private editor: TextEditor,
    private config: ScopeVisualizerConfig,
  ) {
    this.disposables.push(
      // An event that is emitted when a text document is changed. This usually
      // happens when the contents changes but also when other things like the
      // dirty-state changes.
      ide().onDidChangeTextDocument(this.debouncer.run),
      ide().onDidChangeTextEditorVisibleRanges(this.debouncer.run),
      this.debouncer,
    );

    this.debouncer.run();
  }

  async highlightScopes() {
    const {
      document: { languageId },
    } = this.editor;

    const scopeHandler = checkNonNull(
      this.scopeHandlerFactory.create(this.config.scopeType, languageId),
      () => new UnsupportedScopeTypeVisualizationError(languageId),
    );

    const iterationRange = getIterationRange(this.editor, scopeHandler);

    ide().setScopeVisualizationRanges(
      this.editor,
      this.config.includeScopes
        ? getScopes(this.editor, scopeHandler, iterationRange)
        : undefined,
      this.config.includeIterationScopes
        ? this.getIterationScopes(scopeHandler, iterationRange)
        : undefined,
    );
  }

  private getIterationScopes(
    scopeHandler: ScopeHandler,
    iterationRange: Range,
  ): IterationScopeRanges[] | undefined {
    const { editor } = this;
    const {
      document: { languageId },
    } = editor;
    const { scopeType, includeIterationNestedTargets } = this.config;

    const iterationScopeHandler = checkNonNull(
      this.scopeHandlerFactory.create(
        scopeHandler.iterationScopeType,
        languageId,
      ),
      () => new UnsupportedScopeTypeVisualizationError(languageId),
    );

    const everyStage = this.modifierStageFactory.create({
      type: "everyScope",
      scopeType,
    });

    return getIterationScopes(
      editor,
      iterationScopeHandler,
      everyStage,
      iterationRange,
      includeIterationNestedTargets,
    );
  }

  dispose(): void {
    this.disposables.forEach(({ dispose }) => {
      try {
        dispose();
      } catch (e) {
        // do nothing
      }
    });
  }
}
