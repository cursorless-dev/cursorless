import type { Listener } from "../util/Notifier";

export interface IDE {
  configuration: Configuration;

  disposeOnExit(disposable: Disposable): void;
}

export interface Configuration {
  getOwnConfiguration<T>(key: string): T | undefined;
  onDidChangeConfiguration: (listener: Listener) => Disposable;

  mockConfiguration<T>(key: string, value: T): void;
  resetMocks(): void;
}

export interface Disposable {
  dispose(): void;
}
