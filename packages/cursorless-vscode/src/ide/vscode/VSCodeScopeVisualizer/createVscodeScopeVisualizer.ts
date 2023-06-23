import { ScopeType } from "@cursorless/common";
import { VisualizationType } from "../../../ScopeVisualizerCommandApi";
import { VscodeScopeContentVisualizer } from "./VscodeScopeContentVisualizer";
import { VscodeScopeRemovalVisualizer } from "./VscodeScopeRemovalVisualizer";
import { VscodeScopeIterationVisualizer } from "./VscodeScopeIterationVisualizer";
import { VscodeScopeEveryVisualizer } from "./VscodeScopeEveryVisualizer";

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
