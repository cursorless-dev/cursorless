import { Target } from "../typings/target.types";

export type StoredTargetKey = "that" | "source" | "instanceReference";

/**
 * Used to store targets between commands.  This is used by marks like `that`
 * and `source`.
 */
export class StoredTargetMap {
  private targetMap: Map<StoredTargetKey, Target[] | undefined> = new Map();

  set(key: StoredTargetKey, targets: Target[] | undefined) {
    this.targetMap.set(key, targets);
  }

  get(key: StoredTargetKey) {
    return this.targetMap.get(key);
  }
}
