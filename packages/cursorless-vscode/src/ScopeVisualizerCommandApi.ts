import { Disposable, ScopeType } from "@cursorless/common";

export type ScopeVisualizerListener = (
  scopeType: ScopeType | undefined,
  visualizationType: VisualizationType | undefined,
) => void;

export interface ScopeVisualizer {
  start(scopeType: ScopeType, visualizationType: VisualizationType): void;
  stop(): void;
  readonly scopeType: ScopeType | undefined;
  onDidChangeScopeType(listener: ScopeVisualizerListener): Disposable;
}

export type VisualizationType = "content" | "removal" | "iteration";
