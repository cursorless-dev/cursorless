import { ScopeRenderer, showError } from "@cursorless/common";
import { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { ScopeHandlerFactory } from "../processTargets/modifiers/scopeHandlers/ScopeHandlerFactory";
import { ide } from "../singletons/ide.singleton";
import { PerEditor } from "../util/PerEditor";
import { EditorScopeVisualizer } from "./EditorScopeVisualizer";
import { ScopeVisualizer } from "..";

export class ScopeVisualizerImpl implements ScopeVisualizer {
  private scopeVisualizers: PerEditor<EditorScopeVisualizer> | undefined;

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifierStageFactory: ModifierStageFactory,
  ) {}

  start(ideScopeVisualizer: ScopeRenderer) {
    this.stop();
    this.scopeVisualizers = new PerEditor((editor) => {
      const visualizer = new EditorScopeVisualizer(
        this.scopeHandlerFactory,
        this.modifierStageFactory,
        ideScopeVisualizer,
        editor,
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

  refresh() {
    for (const visualizer of this.scopeVisualizers?.values() || []) {
      visualizer.highlightScopes();
    }
  }

  stop() {
    this.scopeVisualizers?.dispose();
    this.scopeVisualizers = undefined;
  }
}
