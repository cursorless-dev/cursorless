import { Target } from "../typings/target.types";

/**
 * Used to store targets between commands.  This is used by marks like `that`
 * and `source`.
 */
export class StoredTargets {
  private targets?: Target[];

  set(targets: Target[] | undefined) {
    this.targets = targets;
  }

  get() {
    return this.targets;
  }
}
