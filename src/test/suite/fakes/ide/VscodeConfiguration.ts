import { Configuration } from "../../../../ide/ide.types";
import { Graph } from "../../../../typings/Types";
import { Notifier } from "../../../../util/Notifier";

export class FakeConfiguration implements Configuration {
  private notifier = new Notifier();
  private mocks: Record<string, unknown> = {};

  constructor(private graph: Graph) {
    this.onDidChangeConfiguration = this.onDidChangeConfiguration.bind(this);
  }

  getOwnConfiguration<T>(key: string): T | undefined {
    return this.mocks[key] as T;
  }

  onDidChangeConfiguration = this.notifier.registerListener;

  mockConfiguration(key: string, value: unknown): void {
    this.mocks[key] = value;
    this.notifier.notifyListeners();
  }

  resetMocks(): void {
    this.mocks = {};
  }
}
