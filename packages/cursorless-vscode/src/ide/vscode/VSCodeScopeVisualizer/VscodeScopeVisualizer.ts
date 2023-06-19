import { GeneralizedRange, ScopeRanges } from "@cursorless/common";
import * as vscode from "vscode";
import { VscodeScopeVisualizerRenderer } from "./VscodeScopeVisualizerRenderer";
import { VscodeTextEditorImpl } from "../VscodeTextEditorImpl";
import tinycolor = require("tinycolor2");

interface ThemeColors {
  light: string;
  dark: string;
}

export interface RangeTypeColors {
  background: ThemeColors;
  borderSolid: ThemeColors;
  borderPorous: ThemeColors;
}

interface ScopeVisualizerThemeColorConfig {
  domain: {
    background: string;
    borderSolid: string;
    borderPorous: string;
  };
  content: {
    background: string;
    borderSolid: string;
    borderPorous: string;
  };
  removal: {
    background: string;
    borderSolid: string;
    borderPorous: string;
  };
}

interface ScopeVisualizerColorConfig {
  light: ScopeVisualizerThemeColorConfig;
  dark: ScopeVisualizerThemeColorConfig;
}

interface VscodeTextEditorScopeRanges {
  editor: VscodeTextEditorImpl;
  scopeRanges: ScopeRanges[];
}

export class VscodeScopeVisualizer {
  private domainRenderer!: VscodeScopeVisualizerRenderer;
  private contentRenderer!: VscodeScopeVisualizerRenderer;
  private removalRenderer!: VscodeScopeVisualizerRenderer;
  private domainContentOverlappingRenderer!: VscodeScopeVisualizerRenderer;
  private domainRemovalOverlappingRenderer!: VscodeScopeVisualizerRenderer;

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
    this.domainRenderer = new VscodeScopeVisualizerRenderer(domainColors);
    this.contentRenderer?.dispose();
    this.contentRenderer = new VscodeScopeVisualizerRenderer(contentColors);
    this.removalRenderer?.dispose();
    this.removalRenderer = new VscodeScopeVisualizerRenderer(removalColors);

    this.domainContentOverlappingRenderer?.dispose();
    this.domainContentOverlappingRenderer = new VscodeScopeVisualizerRenderer(
      blendRangeTypeColors(domainColors, contentColors),
    );
    this.domainRemovalOverlappingRenderer?.dispose();
    this.domainRemovalOverlappingRenderer = new VscodeScopeVisualizerRenderer(
      blendRangeTypeColors(domainColors, removalColors),
    );

    this.drawScopes();
  }

  private editorScopeRanges: VscodeTextEditorScopeRanges[] = [];

  async setScopeVisualizationRanges(
    editorScopeRanges: VscodeTextEditorScopeRanges[],
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

function getColorsFromConfig(
  config: ScopeVisualizerColorConfig,
  rangeType: "domain" | "content" | "removal",
): RangeTypeColors {
  return {
    background: {
      light: config.light[rangeType].background,
      dark: config.dark[rangeType].background,
    },
    borderSolid: {
      light: config.light[rangeType].borderSolid,
      dark: config.dark[rangeType].borderSolid,
    },
    borderPorous: {
      light: config.light[rangeType].borderPorous,
      dark: config.dark[rangeType].borderPorous,
    },
  };
}

function isGeneralizedRangeEqual(
  a: GeneralizedRange,
  b: GeneralizedRange,
): boolean {
  if (a.type === "character" && b.type === "character") {
    return a.start.isEqual(b.start) && a.end.isEqual(b.end);
  }

  if (a.type === "line" && b.type === "line") {
    return a.start === b.start && a.end === b.end;
  }

  return false;
}

function blendRangeTypeColors(
  baseColors: RangeTypeColors,
  topColors: RangeTypeColors,
): RangeTypeColors {
  return {
    background: {
      light: blendColors(
        baseColors.background.light,
        topColors.background.light,
      ),
      dark: blendColors(baseColors.background.dark, topColors.background.dark),
    },
    borderSolid: {
      light: blendColors(
        baseColors.borderSolid.light,
        topColors.borderSolid.light,
      ),
      dark: blendColors(
        baseColors.borderSolid.dark,
        topColors.borderSolid.dark,
      ),
    },
    borderPorous: {
      light: blendColors(
        baseColors.borderPorous.light,
        topColors.borderPorous.light,
      ),
      dark: blendColors(
        baseColors.borderPorous.dark,
        topColors.borderPorous.dark,
      ),
    },
  };
}

function blendColors(base: string, top: string): string {
  const baseRgba = tinycolor(base).toRgb();
  const topRgba = tinycolor(top).toRgb();
  const blendedAlpha = 1 - (1 - topRgba.a) * (1 - baseRgba.a);

  function interpolateChannel(channel: "r" | "g" | "b"): number {
    return Math.round(
      (topRgba[channel] * topRgba.a) / blendedAlpha +
        (baseRgba[channel] * baseRgba.a * (1 - topRgba.a)) / blendedAlpha,
    );
  }

  return tinycolor({
    r: interpolateChannel("r"),
    g: interpolateChannel("g"),
    b: interpolateChannel("b"),
    a: blendedAlpha,
  }).toHex8String();
}
