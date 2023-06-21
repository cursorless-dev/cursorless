import { IdeScopeVisualizer, showError } from "@cursorless/common";
import { ScopeVisualizerConfig } from "../CursorlessEngine.1";
import { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { ScopeHandlerFactory } from "../processTargets/modifiers/scopeHandlers/ScopeHandlerFactory";
import { ide } from "../singletons/ide.singleton";
import { PerEditor } from "../util/PerEditor";
import { EditorScopeVisualizer } from "./EditorScopeVisualizer";

export class ScopeVisualizer {
  private scopeVisualizers: PerEditor | undefined;

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifierStageFactory: ModifierStageFactory,
    private ideVisualizer: IdeScopeVisualizer,
  ) {}

  start(config: ScopeVisualizerConfig) {
    this.scopeVisualizers?.dispose();
    this.scopeVisualizers = new PerEditor((editor) => {
      const visualizer = new EditorScopeVisualizer(
        this.scopeHandlerFactory,
        this.modifierStageFactory,
        this.ideVisualizer,
        editor,
        config,
      );

      visualizer.highlightScopes().catch((err: Error) => {
        if (err.name === "UnsupportedScopeTypeVisualizationError") {
          if (editor.isActive) {
            showError(
              ide().messages,
              "ScopeVisualizer.scopeTypeNotSupported",
              err.message,
            );
          }
          return;
        }

        showError(ide().messages, "ScopeVisualizer.exception", err.message);
      });

      return visualizer;
    });
  }

  stop() {
    this.scopeVisualizers?.dispose();
  }
}
