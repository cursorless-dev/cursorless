import { IterationScopeRanges, ScopeRanges } from "@cursorless/common";
import { getColorsFromConfig } from "./ScopeVisualizerColorConfig";
import { ScopeVisualizerColorConfig } from "./ScopeVisualizerColorConfig";
import { VscodeScopeVisualizer } from "./VscodeScopeVisualizer";

export class VscodeScopeContentVisualizer extends VscodeScopeVisualizer {
  readonly visualizerConfig = {
    scopeType: this.scopeType,
    includeScopes: true,
    includeIterationScopes: false,
    includeIterationNestedTargets: false,
  };

  protected getNestedScopeColorConfig(colorConfig: ScopeVisualizerColorConfig) {
    return getColorsFromConfig(colorConfig, "content");
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
