import { IDE, ScopeType } from "@cursorless/common";
import {
  VscodeScopeVisualizer,
  createVscodeScopeVisualizer,
} from "./ide/vscode/VSCodeScopeVisualizer";
import {
  ScopeVisualizerCommandApi,
  VisualizationType,
} from "./ScopeVisualizerCommandApi";
import { ScopeProvider } from "@cursorless/cursorless-engine";

export function getScopeVisualizerCommandApi(
  ide: IDE,
  scopeProvider: ScopeProvider,
): ScopeVisualizerCommandApi {
  let scopeVisualizer: VscodeScopeVisualizer | undefined;

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
    },

    stop() {
      scopeVisualizer?.dispose();
      scopeVisualizer = undefined;
    },
  };
}
