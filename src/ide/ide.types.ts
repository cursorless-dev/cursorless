import { TokenHatSplittingMode } from "../typings/Types";
import type { Listener } from "../util/Notifier";

export interface IDE {
  configuration: Configuration;
  messages: Messages;

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
  onDidChangeConfiguration(listener: Listener): Disposable;
}

export type MessageId = string;

export interface Messages {
  /**
   * Displays a warning message {@link message} to the user along with possible
   * {@link options} for them to select.
   *
   * @param id Each code site where we issue a warning should have a unique,
   * human readable id for testability, eg "deprecatedPositionInference". This
   * allows us to write tests without tying ourself to the specific wording of
   * the warning message provided in {@link message}.
   * @param message The message to display to the user
   * @param options A list of options to display to the user. The selected
   * option will be returned by this function
   * @returns The option selected by the user, or `undefined` if no option was
   * selected
   */
  showWarning(
    id: MessageId,
    message: string,
    ...options: string[]
  ): Promise<string | undefined>;
}

export interface Disposable {
  dispose(): void;
}
