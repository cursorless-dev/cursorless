import {
  Disposable,
  ScopeRenderer,
  IterationScopeRanges,
  ScopeRanges,
  ScopeType,
  ScopeVisualizerConfig,
  Notifier,
  Listener,
} from "@cursorless/common";
import * as vscode from "vscode";
import { VscodeTextEditorImpl } from "../VscodeTextEditorImpl";
import { getColorsFromConfig } from "./ScopeVisualizerColorConfig";
import { ScopeVisualizerColorConfig } from "./ScopeVisualizerColorConfig";
import { RendererScope, VscodeScopeRenderer } from "./VscodeScopeRenderer";
import { RangeTypeColors } from "./RangeTypeColors";
import { VisualizationType } from "../../../ScopeVisualizerCommandApi";

export abstract class VscodeScopeVisualizer implements ScopeRenderer {
  private renderer!: VscodeScopeRenderer;
  private disposables: Disposable[] = [];
  abstract readonly visualizerConfig: ScopeVisualizerConfig;
  private notifier: Notifier = new Notifier();

  protected abstract getRendererScopes(
    scopeRanges: ScopeRanges[] | undefined,
    iterationScopeRanges: IterationScopeRanges[] | undefined,
  ): RendererScope[];

  protected abstract getNestedScopeColorConfig(
    colorConfig: ScopeVisualizerColorConfig,
  ): RangeTypeColors;

  constructor(
    protected scopeType: ScopeType,
    private visualizationType: VisualizationType,
  ) {
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(({ affectsConfiguration }) => {
        if (affectsConfiguration("cursorless.scopeVisualizer.colors")) {
          this.computeColors();
          this.notifier.notifyListeners();
        }
      }),
    );

    this.computeColors();
  }

  private computeColors() {
    const colorConfig = vscode.workspace
      .getConfiguration("cursorless.scopeVisualizer")
      .get<ScopeVisualizerColorConfig>("colors")!;

    this.renderer?.dispose();
    this.renderer = new VscodeScopeRenderer(
      getColorsFromConfig(colorConfig, "domain"),
      this.getNestedScopeColorConfig(colorConfig),
    );
  }

  onColorConfigChange(listener: Listener) {
    return this.notifier.registerListener(listener);
  }

  async setScopes(
    editor: VscodeTextEditorImpl,
    scopeRanges: ScopeRanges[] | undefined,
    iterationScopeRanges: IterationScopeRanges[] | undefined,
  ) {
    this.renderer.setScopes(
      editor,
      this.getRendererScopes(scopeRanges, iterationScopeRanges),
    );
  }

  dispose() {
    this.disposables.forEach((disposable) => disposable.dispose());
    this.renderer.dispose();
  }
}
