import { IterationScopeRanges, ScopeRanges } from "@cursorless/common";
import { getColorsFromConfig } from "./ScopeVisualizerColorConfig";
import { ScopeVisualizerColorConfig } from "./ScopeVisualizerColorConfig";
import { VscodeScopeVisualizer } from "./VscodeScopeVisualizer";

export class VscodeScopeIterationVisualizer extends VscodeScopeVisualizer {
  readonly visualizerConfig = {
    scopeType: this.scopeType,
    includeScopes: false,
    includeIterationScopes: true,
    includeIterationNestedTargets: false,
  };

  protected getNestedScopeColorConfig(colorConfig: ScopeVisualizerColorConfig) {
    return getColorsFromConfig(colorConfig, "iteration");
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
