import { pull } from "lodash-es";
import type {
  Disposable,
  IDE,
  ScopeProvider,
  ScopeType,
} from "@cursorless/lib-common";
import { createVscodeScopeVisualizer } from "./ide/vscode/VSCodeScopeVisualizer";
import type { VscodeScopeVisualizer } from "./ide/vscode/VSCodeScopeVisualizer";
import type {
  ScopeVisualizer,
  ScopeVisualizerListener,
  VisualizationType,
} from "./ScopeVisualizerCommandApi";

export function createScopeVisualizer(
  ide: IDE,
  scopeProvider: ScopeProvider,
): ScopeVisualizer {
  let scopeVisualizer: VscodeScopeVisualizer | undefined;
  let currentScopeType: ScopeType | undefined;

  const listeners: ScopeVisualizerListener[] = [];

  return {
    start(scopeType: ScopeType, visualizationType: VisualizationType) {
      scopeVisualizer?.dispose();
      scopeVisualizer = createVscodeScopeVisualizer(
        ide,
        scopeProvider,
        scopeType,
        visualizationType,
      );
      scopeVisualizer.start();
      currentScopeType = scopeType;
      for (const listener of listeners.slice()) {
        listener(scopeType, visualizationType);
      }
    },

    stop() {
      scopeVisualizer?.dispose();
      scopeVisualizer = undefined;
      currentScopeType = undefined;
      for (const listener of listeners.slice()) {
        listener(undefined, undefined);
      }
    },

    get scopeType() {
      return currentScopeType;
    },

    onDidChangeScopeType(listener: ScopeVisualizerListener): Disposable {
      listeners.push(listener);

      return {
        dispose() {
          pull(listeners, listener);
        },
      };
    },
  };
}
