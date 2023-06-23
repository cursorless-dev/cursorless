import { ScopeType } from "@cursorless/common";

export interface ScopeVisualizerCommandApi {
  start(scopeType: ScopeType, visualizationType: VisualizationType): void;
  stop(): void;
}

export type VisualizationType = "content" | "removal" | "iteration" | "every";
