import { IDE, ScopeType } from "@cursorless/common";
import { ScopeProvider } from "@cursorless/cursorless-engine";
import { VisualizationType } from "../../../ScopeVisualizerCommandApi";
import { VscodeScopeIterationVisualizer } from "./VscodeScopeIterationVisualizer";
import {
  VscodeScopeContentVisualizer,
  VscodeScopeRemovalVisualizer,
} from "./VscodeScopeTargetVisualizer";

export function createVscodeScopeVisualizer(
  ide: IDE,
  scopeProvider: ScopeProvider,
  scopeType: ScopeType,
  visualizationType: VisualizationType,
) {
  switch (visualizationType) {
    case "content":
      return new VscodeScopeContentVisualizer(ide, scopeProvider, scopeType);
    case "removal":
      return new VscodeScopeRemovalVisualizer(ide, scopeProvider, scopeType);
    case "iteration":
      return new VscodeScopeIterationVisualizer(ide, scopeProvider, scopeType);
  }
}
