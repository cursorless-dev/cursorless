import { TokenHatSplittingMode } from "../typings/Types";
import type { Listener } from "../util/Notifier";

export interface IDE {
  configuration: Configuration;

  /**
   * Register disposables to be disposed of on IDE exit.
   *
   * @param disposables A list of {@link Disposable}s to dispose when the IDE is exited.
   * @returns A function that can be called to deregister the disposables
   */
  disposeOnExit(...disposables: Disposable[]): () => void;
}

export interface CursorlessConfiguration {
  tokenHatSplittingMode: TokenHatSplittingMode;
}
export type CursorlessConfigKey = keyof CursorlessConfiguration;

export interface Configuration {
  getOwnConfiguration<T extends CursorlessConfigKey>(
    key: T,
  ): CursorlessConfiguration[T] | undefined;
  onDidChangeConfiguration: (listener: Listener) => Disposable;

  mockConfiguration<T extends CursorlessConfigKey>(
    key: T,
    value: CursorlessConfiguration[T],
  ): void;
  resetMocks(): void;
}

export interface Disposable {
  dispose(): void;
}
