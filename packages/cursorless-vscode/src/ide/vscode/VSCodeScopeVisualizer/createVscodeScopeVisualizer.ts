import { IDE, ScopeProvider, ScopeType } from "@cursorless/common";
import { VisualizationType } from "../../../ScopeVisualizerCommandApi";
import { VscodeIterationScopeVisualizer } from "./VscodeIterationScopeVisualizer";
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
      return new VscodeIterationScopeVisualizer(ide, scopeProvider, scopeType);
  }
}
