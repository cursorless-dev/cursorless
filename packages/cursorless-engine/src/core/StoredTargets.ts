import { DefaultMap } from "@cursorless/common";
import { Target } from "../typings/target.types";

/**
 * Used to store targets between commands.  This is used by marks like `that`
 * and `source`.
 */
export class StoredTargetMap {
  private targetMap: DefaultMap<string, StoredTargets> = new DefaultMap(
    () => new StoredTargets(),
  );

  set(key: string, targets: Target[] | undefined) {
    this.targetMap.get(key).set(targets);
  }

  get(key: string) {
    return this.targetMap.get(key).get();
  }
}

class StoredTargets {
  private targets?: Target[];

  set(targets: Target[] | undefined) {
    this.targets = targets;
  }

  get() {
    return this.targets;
  }
}
