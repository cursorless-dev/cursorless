import { Notifier } from "@cursorless/common";
import { Target } from "../typings/target.types";
import { StoredTargetKey, storedTargetKeys } from "@cursorless/common";

/**
 * Used to store targets between commands.  This is used by marks like `that`
 * and `source`.
 */
export class StoredTargetMap {
  private targetMap: Map<StoredTargetKey, Target[] | undefined> = new Map();
  private notifier = new Notifier<[StoredTargetKey, Target[] | undefined]>();

  set(key: StoredTargetKey, targets: Target[] | undefined) {
    // TODO: Figure out how to set a target to undefined
    // Maybe need separate command?
    this.targetMap.set(key, targets);
    this.notifier.notifyListeners(key, targets);
  }

  get(key: StoredTargetKey) {
    return this.targetMap.get(key);
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
