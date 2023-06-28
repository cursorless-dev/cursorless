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

export class ScopeVisualizerImpl implements ScopeVisualizerCommandApi {
  private scopeVisualizer: VscodeScopeVisualizer | undefined;

  constructor(private ide: IDE, private scopeProvider: ScopeProvider) {
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  start(scopeType: ScopeType, visualizationType: VisualizationType) {
    this.stop();
    this.scopeVisualizer = createVscodeScopeVisualizer(
      this.ide,
      this.scopeProvider,
      scopeType,
      visualizationType,
    );
    this.scopeVisualizer.start();
  }

  stop() {
    this.scopeVisualizer?.dispose();
    this.scopeVisualizer = undefined;
  }
}
