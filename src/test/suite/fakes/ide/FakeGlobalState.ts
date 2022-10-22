import { State } from "../../../../ide/ide.types";

export default class FakeGlobalState implements State {
  private readonly data: Map<string, any> = new Map();

  get<T>(key: string, defaultValue?: T): T {
    return this.data.has(key) ? this.data.get(key) : defaultValue;
  }

  set(key: string, value: any): Thenable<void> {
    this.data.set(key, value);
    return Promise.resolve();
  }
}
