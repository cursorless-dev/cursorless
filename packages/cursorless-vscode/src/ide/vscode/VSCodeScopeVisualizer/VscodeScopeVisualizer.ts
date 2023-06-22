import {
  Disposable,
  ScopeRenderer,
  IterationScopeRanges,
  ScopeRanges,
  ScopeType,
  ScopeVisualizerConfig,
} from "@cursorless/common";
import * as vscode from "vscode";
import { VscodeTextEditorImpl } from "../VscodeTextEditorImpl";
import {
  ColorConfigKey,
  getColorsFromConfig,
} from "./ScopeVisualizerColorConfig";
import { ScopeVisualizerColorConfig } from "./ScopeVisualizerColorConfig";
import { RendererScope, VscodeScopeRenderer } from "./VscodeScopeRenderer";
import {
  VisualizationType,
  getVisualizerConfig,
} from "../../../getVisualizerConfig";

export abstract class VscodeScopeVisualizer implements ScopeRenderer {
  private renderer!: VscodeScopeRenderer;
  private disposables: Disposable[] = [];
  visualizerConfig: ScopeVisualizerConfig;

  protected abstract getRendererScopes(
    scopeRanges: ScopeRanges[] | undefined,
    iterationScopeRanges: IterationScopeRanges[] | undefined,
  ): RendererScope[];

  constructor(
    scopeType: ScopeType,
    private visualizationType: VisualizationType,
    private colorConfigKey: ColorConfigKey,
  ) {
    this.visualizerConfig = getVisualizerConfig(visualizationType, scopeType);

    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(({ affectsConfiguration }) => {
        if (affectsConfiguration("cursorless.scopeVisualizer.colors")) {
          this.computeColors();
        }
      }),
    );

    this.computeColors();
  }

  private computeColors() {
    const colorConfig = vscode.workspace
      .getConfiguration("cursorless.scopeVisualizer")
      .get<ScopeVisualizerColorConfig>("colors")!;

    this.renderer = new VscodeScopeRenderer(
      getColorsFromConfig(colorConfig, "domain"),
      getColorsFromConfig(colorConfig, this.colorConfigKey),
    );
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

class VscodeScopeContentVisualizer extends VscodeScopeVisualizer {
  constructor(scopeType: ScopeType, visualizationType: VisualizationType) {
    super(scopeType, visualizationType, "content" as const);
  }

  protected getRendererScopes(
    scopeRanges: ScopeRanges[] | undefined,
    _iterationScopeRanges: IterationScopeRanges[] | undefined,
  ) {
    return scopeRanges!.map(({ domain, targets }) => ({
      domain,
      nestedRanges: targets.map(({ contentRange }) => contentRange),
    }));
  }
}

class VscodeScopeRemovalVisualizer extends VscodeScopeVisualizer {
  constructor(scopeType: ScopeType, visualizationType: VisualizationType) {
    super(scopeType, visualizationType, "removal" as const);
  }

  protected getRendererScopes(
    scopeRanges: ScopeRanges[] | undefined,
    _iterationScopeRanges: IterationScopeRanges[] | undefined,
  ) {
    return scopeRanges!.map(({ domain, targets }) => ({
      domain,
      nestedRanges: targets.map(({ removalRange }) => removalRange),
    }));
  }
}

class VscodeScopeIterationVisualizer extends VscodeScopeVisualizer {
  constructor(scopeType: ScopeType, visualizationType: VisualizationType) {
    super(scopeType, visualizationType, "iteration" as const);
  }

  protected getRendererScopes(
    _scopeRanges: ScopeRanges[] | undefined,
    iterationScopeRanges: IterationScopeRanges[] | undefined,
  ) {
    return iterationScopeRanges!.map(({ domain, ranges }) => ({
      domain,
      nestedRanges: ranges.map(({ range }) => range),
    }));
  }
}

class VscodeScopeEveryVisualizer extends VscodeScopeVisualizer {
  constructor(scopeType: ScopeType, visualizationType: VisualizationType) {
    super(scopeType, visualizationType, "content" as const);
  }

  protected getRendererScopes(
    _scopeRanges: ScopeRanges[] | undefined,
    iterationScopeRanges: IterationScopeRanges[] | undefined,
  ) {
    return iterationScopeRanges!.map(({ domain, ranges }) => ({
      domain,
      nestedRanges: ranges.flatMap(({ targets }) =>
        targets!.map(({ contentRange }) => contentRange),
      ),
    }));
  }
}

export function createVscodeScopeVisualizer(
  scopeType: ScopeType,
  visualizationType: VisualizationType,
) {
  switch (visualizationType) {
    case "content":
      return new VscodeScopeContentVisualizer(scopeType, visualizationType);
    case "removal":
      return new VscodeScopeRemovalVisualizer(scopeType, visualizationType);
    case "iteration":
      return new VscodeScopeIterationVisualizer(scopeType, visualizationType);
    case "every":
      return new VscodeScopeEveryVisualizer(scopeType, visualizationType);
  }
}
