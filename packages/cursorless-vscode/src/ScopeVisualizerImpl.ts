import { ScopeType } from "@cursorless/common";
import { ScopeVisualizer } from "@cursorless/cursorless-engine";
import {
  VscodeScopeVisualizer,
  createVscodeScopeVisualizer,
} from "./ide/vscode/VSCodeScopeVisualizer";
import {
  ScopeVisualizerCommandApi,
  VisualizationType,
} from "./ScopeVisualizerCommandApi";

export class ScopeVisualizerImpl implements ScopeVisualizerCommandApi {
  private scopeVisualizer: VscodeScopeVisualizer | undefined;

  constructor(private engineScopeVisualizer: ScopeVisualizer) {
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  start(scopeType: ScopeType, visualizationType: VisualizationType) {
    this.stop();
    this.scopeVisualizer = createVscodeScopeVisualizer(
      scopeType,
      visualizationType,
    );

    this.engineScopeVisualizer.start(this.scopeVisualizer);

    this.scopeVisualizer.onColorConfigChange(() =>
      this.engineScopeVisualizer.refresh(),
    );
  }

  stop() {
    this.engineScopeVisualizer.stop();
    this.scopeVisualizer?.dispose();
    this.scopeVisualizer = undefined;
  }
}
