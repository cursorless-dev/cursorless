import { Target } from "../typings/target.types";

export class ThatMark {
  private mark?: Target[];

  set(targets: Target[] | undefined) {
    this.mark = targets;
  }

  get() {
    if (this.mark == null) {
      throw Error("Mark is undefined");
    }
    return this.mark;
  }

  exists() {
    return this.mark != null;
  }
}
