import { ScopeType, ScopeVisualizerConfig } from "@cursorless/common";

export type VisualizationType = "content" | "removal" | "iteration" | "every";

export function getVisualizerConfig(
  visualizationType: VisualizationType,
  scopeType: ScopeType,
): ScopeVisualizerConfig {
  switch (visualizationType) {
    case "content":
    case "removal":
      return {
        scopeType,
        includeScopes: true,
        includeIterationScopes: false,
        includeIterationNestedTargets: false,
      };

    case "iteration":
    case "every":
      return {
        scopeType,
        includeScopes: false,
        includeIterationScopes: true,
        includeIterationNestedTargets: visualizationType === "every",
      };
  }
}
