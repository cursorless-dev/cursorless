import { pull } from "lodash-es";
import type {
  Disposable,
  IDE,
  ScopeProvider,
  ScopeType,
} from "@cursorless/lib-common";
import { isPseudoScopeType } from "@cursorless/lib-common";
import type { VscodeScopeVisualizer } from "./ide/vscode/VSCodeScopeVisualizer";
import { createVscodeScopeVisualizer } from "./ide/vscode/VSCodeScopeVisualizer";
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
      if (isPseudoScopeType(scopeType)) {
        throw new Error(
          `Can't visualize pseudo scopes like '${scopeType.type}'`,
        );
      }

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
