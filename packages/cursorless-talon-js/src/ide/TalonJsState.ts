import type { State } from "@cursorless/common";

export class TalonJsState implements State {
  get<K extends "hideInferenceWarning">(
    key: K,
  ): { hideInferenceWarning: boolean }[K] {
    throw new Error("get not implemented.");
  }

  set<K extends "hideInferenceWarning">(
    key: K,
    value: { hideInferenceWarning: boolean }[K],
  ): Promise<void> {
    throw new Error("set not implemented.");
  }
}
