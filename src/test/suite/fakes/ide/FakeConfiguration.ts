import {
  Configuration,
  CursorlessConfigKey,
  CursorlessConfiguration,
} from "../../../../ide/ide.types";
import { Graph } from "../../../../typings/Types";
import { Notifier } from "../../../../util/Notifier";

export default class FakeConfiguration implements Configuration {
  private notifier = new Notifier();
  private mocks: Partial<CursorlessConfiguration> = {};

  constructor(private graph: Graph) {
    this.onDidChangeConfiguration = this.onDidChangeConfiguration.bind(this);
  }

  getOwnConfiguration<T extends CursorlessConfigKey>(
    key: T,
  ): CursorlessConfiguration[T] | undefined {
    return this.mocks[key];
  }

  onDidChangeConfiguration = this.notifier.registerListener;

  mockConfiguration<T extends CursorlessConfigKey>(
    key: T,
    value: CursorlessConfiguration[T],
  ): void {
    this.mocks[key] = value;
    this.notifier.notifyListeners();
  }

  resetMocks(): void {
    this.mocks = {};
  }
}
