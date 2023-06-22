import { ScopeType } from "@cursorless/common";
import { ScopeVisualizer } from "@cursorless/cursorless-engine";
import {
  createVscodeScopeVisualizer,
  VscodeScopeVisualizer,
} from "./ide/vscode/VSCodeScopeVisualizer";
import { VisualizationType } from "./getVisualizerConfig";

export interface ScopeVisualizerCommandApi {
  start(scopeType: ScopeType, visualizationType: VisualizationType): void;
  stop(): void;
}

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
  }

  stop() {
    this.engineScopeVisualizer.stop();
    this.scopeVisualizer?.dispose();
    this.scopeVisualizer = undefined;
  }
}
