import {
  TutorialId,
  TutorialState,
  Disposable,
  ScopeType,
} from "@cursorless/common";
import { Tutorial } from "../api/Tutorial";

export class DisabledTutorial implements Tutorial {
  start(_id: number | TutorialId): Promise<void> {
    throw new Error("Method not implemented.");
  }
  next(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  previous(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  restart(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  resume(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  list(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  onState(_callback: (state: TutorialState) => void): Disposable {
    return { dispose: () => {} };
  }
  readonly state: TutorialState = { type: "loading" };

  docsOpened(): void {
    // Do nothing
  }
  scopeTypeVisualized(_scopeType: ScopeType | undefined): void {
    // Do nothing
  }
}
