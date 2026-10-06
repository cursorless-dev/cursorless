import type { Listener } from "../../util/Notifier";
import { HatStability } from "./HatStability";
import type { Disposable } from "./ide.types";
import type { GetFieldType, Paths } from "./Paths";

export type CursorlessConfiguration = {
  wordSeparators: string[];
  experimental: {
    hatStability: HatStability;
    keyboardTargetFollowsSelection: boolean;
  };
  decorationDebounceDelayMs: number;
  commandHistory: boolean;
  debug: boolean;
};

export type CursorlessConfigKey = keyof CursorlessConfiguration;
export type ConfigurationScope = { languageId: string };

export const CONFIGURATION_DEFAULTS: CursorlessConfiguration = {
  wordSeparators: ["_"],
  decorationDebounceDelayMs: 50,
  experimental: {
    hatStability: HatStability.balanced,
    keyboardTargetFollowsSelection: false,
  },
  commandHistory: false,
  debug: false,
};

export interface Configuration {
  /**
   * Returns a Cursorless configuration value.  Dots are accepted in
   * {@link path}, and are interpreted as child access, eg
   * `experimental.hatStability`.
   *
   * @param path A configuration key or path.  Dots are interpreted as child
   * access
   * @param scope An optional scope specifier, indicating eg language id
   */
  getOwnConfiguration<Path extends Paths<CursorlessConfiguration>>(
    path: Path,
    scope?: ConfigurationScope,
  ): GetFieldType<CursorlessConfiguration, Path>;

  onDidChangeConfiguration(listener: Listener): Disposable;
}
