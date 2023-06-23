import tinycolor = require("tinycolor2");
import { IterationScopeRanges, ScopeRanges } from "@cursorless/common";
import { RangeTypeColors } from "./RangeTypeColors";
import {
  ScopeVisualizerColorConfig,
  getColorsFromConfig,
} from "./ScopeVisualizerColorConfig";
import { VscodeScopeVisualizer } from "./VscodeScopeVisualizer";

export class VscodeScopeEveryVisualizer extends VscodeScopeVisualizer {
  readonly visualizerConfig = {
    scopeType: this.scopeType,
    includeScopes: false,
    includeIterationScopes: true,
    includeIterationNestedTargets: true,
  };

  protected getNestedScopeColorConfig(colorConfig: ScopeVisualizerColorConfig) {
    return weakenRangeTypeColors(getColorsFromConfig(colorConfig, "content"));
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

const BORDER_WEAKENING = 0.8;
const BACKGROUND_WEAKENING = 0.2;

function weakenRangeTypeColors(colors: RangeTypeColors): RangeTypeColors {
  return {
    background: {
      light: weakenColor(colors.background.light, BACKGROUND_WEAKENING),
      dark: weakenColor(colors.background.dark, BACKGROUND_WEAKENING),
    },
    borderSolid: {
      light: weakenColor(colors.borderSolid.light, BORDER_WEAKENING),
      dark: weakenColor(colors.borderSolid.dark, BORDER_WEAKENING),
    },
    borderPorous: {
      light: weakenColor(colors.borderPorous.light, BORDER_WEAKENING),
      dark: weakenColor(colors.borderPorous.dark, BORDER_WEAKENING),
    },
  };
}

function weakenColor(color: string, amount: number): string {
  const parsed = tinycolor(color);
  parsed.setAlpha(parsed.getAlpha() * amount);
  return parsed.toHex8String();
}
