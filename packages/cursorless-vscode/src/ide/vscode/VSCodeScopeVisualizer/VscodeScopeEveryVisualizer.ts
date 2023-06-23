import {
  IterationScopeRanges,
  ScopeRanges
} from "@cursorless/common";
import { getColorsFromConfig } from "./ScopeVisualizerColorConfig";
import { ScopeVisualizerColorConfig } from "./ScopeVisualizerColorConfig";
import { weakenRangeTypeColors } from "./weakenRangeTypeColors";
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
    iterationScopeRanges: IterationScopeRanges[] | undefined
  ) {
    return iterationScopeRanges!.map(({ domain, ranges }) => ({
      domain,
      nestedRanges: ranges.flatMap(({ targets }) => targets!.map(({ contentRange }) => contentRange)
      ),
    }));
  }
}
