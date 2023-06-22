import {
  GeneralizedRange,
  IterationScopeRanges,
  ScopeRanges,
} from "@cursorless/common";
import * as vscode from "vscode";
import { VscodeTextEditorImpl } from "../VscodeTextEditorImpl";
import { VscodeFancyRangeHighlighter } from "./VscodeFancyRangeHighlighter";
import { isGeneralizedRangeEqual } from "./isGeneralizedRangeEqual";
import { blendRangeTypeColors } from "./blendRangeTypeColors";
import { getColorsFromConfig } from "./getColorsFromConfig";
import { ScopeVisualizerColorConfig } from "./ScopeVisualizerColorConfig";

export class VscodeScopeVisualizer {
  private domainRenderer!: VscodeFancyRangeHighlighter;
  private contentRenderer!: VscodeFancyRangeHighlighter;
  private removalRenderer!: VscodeFancyRangeHighlighter;
  private domainContentOverlappingRenderer!: VscodeFancyRangeHighlighter;
  private domainRemovalOverlappingRenderer!: VscodeFancyRangeHighlighter;

  constructor(extensionContext: vscode.ExtensionContext) {
    this.computeColors();

    extensionContext.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(({ affectsConfiguration }) => {
        if (affectsConfiguration("cursorless.scopeVisualizer.colors")) {
          this.computeColors();
        }
      }),
    );
  }

  private computeColors() {
    const config = vscode.workspace
      .getConfiguration("cursorless.scopeVisualizer")
      .get<ScopeVisualizerColorConfig>("colors")!;

    const domainColors = getColorsFromConfig(config, "domain");
    const contentColors = getColorsFromConfig(config, "content");
    const removalColors = getColorsFromConfig(config, "removal");

    this.domainRenderer?.dispose();
    this.domainRenderer = new VscodeFancyRangeHighlighter(domainColors);
    this.contentRenderer?.dispose();
    this.contentRenderer = new VscodeFancyRangeHighlighter(contentColors);
    this.removalRenderer?.dispose();
    this.removalRenderer = new VscodeFancyRangeHighlighter(removalColors);

    this.domainContentOverlappingRenderer?.dispose();
    this.domainContentOverlappingRenderer = new VscodeFancyRangeHighlighter(
      blendRangeTypeColors(domainColors, contentColors),
    );
    this.domainRemovalOverlappingRenderer?.dispose();
    this.domainRemovalOverlappingRenderer = new VscodeFancyRangeHighlighter(
      blendRangeTypeColors(domainColors, removalColors),
    );

    this.drawScopes();
  }

  private editorScopeRanges: VscodeTextEditorScopeRanges[] = [];

  async setScopeVisualizationRanges(
    editor: VscodeTextEditorImpl,
    scopeRanges: ScopeRanges[] | undefined,
    iterationScopeRanges: IterationScopeRanges[] | undefined,
  ) {
    this.editorScopeRanges = editorScopeRanges;
    this.drawScopes();
  }

  private drawScopes() {
    this.editorScopeRanges.forEach(({ editor, scopeRanges }) => {
      this.setScopeVisualizationRangesForEditor(editor, scopeRanges);
    });
  }

  async setScopeVisualizationRangesForEditor(
    editor: VscodeTextEditorImpl,
    scopeRanges: ScopeRanges[],
  ): Promise<void> {
    const domainRanges: GeneralizedRange[] = [];
    const contentRanges: GeneralizedRange[] = [];
    const removalRanges: GeneralizedRange[] = [];
    const domainEqualsContentRanges: GeneralizedRange[] = [];
    const domainEqualsRemovalRanges: GeneralizedRange[] = [];

    for (const scopeRange of scopeRanges) {
      if (
        scopeRange.contentRanges?.length === 1 &&
        (scopeRange.removalRanges?.length ?? 0) === 0 &&
        isGeneralizedRangeEqual(scopeRange.contentRanges[0], scopeRange.domain)
      ) {
        domainEqualsContentRanges.push(scopeRange.domain);
        continue;
      }

      if (
        (scopeRange.contentRanges?.length ?? 0) === 0 &&
        scopeRange.removalRanges?.length === 1 &&
        isGeneralizedRangeEqual(scopeRange.removalRanges[0], scopeRange.domain)
      ) {
        domainEqualsRemovalRanges.push(scopeRange.domain);
        continue;
      }

      domainRanges.push(scopeRange.domain);
      scopeRange.contentRanges?.forEach((range) => contentRanges.push(range));
      scopeRange.removalRanges?.forEach((range) => removalRanges.push(range));
    }

    this.domainRenderer.setRanges(editor, domainRanges);
    this.contentRenderer.setRanges(editor, contentRanges);
    this.removalRenderer.setRanges(editor, removalRanges);
    this.domainContentOverlappingRenderer.setRanges(
      editor,
      domainEqualsContentRanges,
    );
    this.domainRemovalOverlappingRenderer.setRanges(
      editor,
      domainEqualsRemovalRanges,
    );
  }
}
