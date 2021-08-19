import { SelectionWithEditor } from "../typings/Types";

export class ThatMark {
  private mark?: SelectionWithEditor[];

  set(value?: SelectionWithEditor[]) {
    this.mark = value;
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
