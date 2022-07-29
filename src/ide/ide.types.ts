import type { Listener } from "../util/Notifier";

export interface IDE {
  configuration: Configuration;

  disposeOnExit(disposable: Disposable): void;
}

export interface Configuration {
  getOwnConfiguration<T>(key: string): T | undefined;
  onDidChangeConfiguration: (listener: Listener) => Disposable;

  mockConfiguration(key: string, value: unknown): void;
  resetMocks(): void;
}

export interface Disposable {
  dispose(): void;
}
