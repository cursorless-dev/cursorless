import { IDE, ScopeType } from "@cursorless/common";
import { ScopeProvider } from "@cursorless/cursorless-engine";
import { VisualizationType } from "../../../ScopeVisualizerCommandApi";
import { VscodeScopeIterationVisualizer } from "./VscodeScopeIterationVisualizer";
import {
  VscodeScopeContentVisualizer,
  VscodeScopeRemovalVisualizer,
} from "./VscodeScopeTargetVisualizer";
import { Vscode } from "@cursorless/vscode-common";

export function createVscodeScopeVisualizer(
  vscode: Vscode,
  ide: IDE,
  scopeProvider: ScopeProvider,
  scopeType: ScopeType,
  visualizationType: VisualizationType,
) {
  switch (visualizationType) {
    case "content":
      return new VscodeScopeContentVisualizer(
        vscode,
        ide,
        scopeProvider,
        scopeType,
      );
    case "removal":
      return new VscodeScopeRemovalVisualizer(
        vscode,
        ide,
        scopeProvider,
        scopeType,
      );
    case "iteration":
      return new VscodeScopeIterationVisualizer(
        vscode,
        ide,
        scopeProvider,
        scopeType,
      );
  }
}
