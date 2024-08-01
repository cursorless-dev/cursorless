import type {
  Disposable,
  ScopeType,
  TutorialId,
  TutorialState,
} from "@cursorless/common";

/**
 * Interface for controlling the Cursorless tutorial
 */
export interface Tutorial {
  start(id: TutorialId | number): Promise<void>;
  next(): Promise<void>;
  previous(): Promise<void>;
  restart(): Promise<void>;
  resume(): Promise<void>;
  list(): Promise<void>;

  onState(callback: (state: TutorialState) => void): Disposable;
  readonly state: TutorialState;

  /**
   * Call this when the user opens the documentation so that the tutorial can
   * advance to the next step if it's waiting for that.
   */
  documentationOpened(): void;

  /**
   * Call this when the user visualizes a scope type so that the tutorial can
   * advance to the next step if it's waiting for that.
   */
  scopeTypeVisualized(scopeType: ScopeType | undefined): void;
}
