import { DefaultMap, Notifier } from "@cursorless/common";
import { Target } from "../typings/target.types";
import { StoredTargetKey, storedTargetKeys } from "@cursorless/common";
import { UndoStack } from "./UndoStack";

const MAX_HISTORY_LENGTH = 25;

/**
 * Used to store targets between commands.  This is used by marks like `that`
 * and `source`.
 */
export class StoredTargetMap {
  private targetMap: Map<StoredTargetKey, Target[] | undefined> = new Map();

  // FIXME: Keep these targets up to date as document changes
  private targetHistory: DefaultMap<StoredTargetKey, UndoStack<Target[]>> =
    new DefaultMap(() => new UndoStack<Target[]>(MAX_HISTORY_LENGTH));

  private notifier = new Notifier<[StoredTargetKey, Target[] | undefined]>();

  set(
    key: StoredTargetKey,
    targets: Target[] | undefined,
    { history = false }: { history?: boolean } = {},
  ) {
    this.targetMap.set(key, targets);
    if (history && targets != null) {
      this.targetHistory.get(key).push(targets);
    }
    this.notifier.notifyListeners(key, targets);
  }

  get(key: StoredTargetKey) {
    return this.targetMap.get(key);
  }

  undo(key: StoredTargetKey) {
    const targets = this.targetHistory.get(key).undo();

    if (targets != null) {
      this.set(key, targets, { history: false });
    }
  }

  redo(key: StoredTargetKey) {
    const targets = this.targetHistory.get(key).redo();

    if (targets != null) {
      this.set(key, targets, { history: false });
    }
  }

  onStoredTargets(
    callback: (key: StoredTargetKey, targets: Target[] | undefined) => void,
  ) {
    for (const key of storedTargetKeys) {
      callback(key, this.get(key));
    }

    return this.notifier.registerListener(callback);
  }
}
