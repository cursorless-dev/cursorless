import { Disposable, ScopeType } from "@cursorless/common";

export type VisualizerScopeTypeListener = (
  scopeType: ScopeType | undefined,
  visualizationType: VisualizationType | undefined,
) => void;

export interface ScopeVisualizer {
  start(scopeType: ScopeType, visualizationType: VisualizationType): void;
  stop(): void;
  readonly scopeType: ScopeType | undefined;
  onDidChangeScopeType(listener: VisualizerScopeTypeListener): Disposable;
}

export type VisualizationType = "content" | "removal" | "iteration";
