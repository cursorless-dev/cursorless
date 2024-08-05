import { get } from "lodash-es";
import {
  HatStability,
  type Configuration,
  type ConfigurationScope,
  type CursorlessConfiguration,
  type Disposable,
  type GetFieldType,
  type Listener,
  type Paths,
} from "@cursorless/common";

const CONFIGURATION_DEFAULTS: CursorlessConfiguration = {
  tokenHatSplittingMode: {
    preserveCase: false,
    lettersToPreserve: [],
    symbolsToPreserve: [],
  },
  wordSeparators: ["_"],
  decorationDebounceDelayMs: 50,
  experimental: {
    snippetsDir: undefined,
    hatStability: HatStability.balanced,
    keyboardTargetFollowsSelection: false,
  },
  commandHistory: false,
  debug: false,
};

export class TalonJsConfiguration implements Configuration {
  getOwnConfiguration<Path extends Paths<CursorlessConfiguration>>(
    path: Path,
    _scope?: ConfigurationScope | undefined,
  ): GetFieldType<CursorlessConfiguration, Path> {
    return get(CONFIGURATION_DEFAULTS, path) as GetFieldType<
      CursorlessConfiguration,
      Path
    >;
  }

  onDidChangeConfiguration(_listener: Listener): Disposable {
    // Do nothing. For now the configuration can't change
    return {
      dispose: () => {},
    };
  }
}
