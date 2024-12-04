import { HatStability } from "@cursorless/common";
import { get } from "lodash";
import type {
  Configuration,
  ConfigurationScope,
  CursorlessConfiguration,
} from "@cursorless/common";
import { CONFIGURATION_DEFAULTS } from "@cursorless/common";
import type { GetFieldType, Paths } from "@cursorless/common";
import { Notifier } from "@cursorless/common";

export class JetbrainsConfiguration implements Configuration {
  private notifier = new Notifier();
  private configuration: CursorlessConfiguration = CONFIGURATION_DEFAULTS;

  constructor(configuration: CursorlessConfiguration) {
    this.configuration = configuration;
  }

  getOwnConfiguration<Path extends Paths<CursorlessConfiguration>>(
    path: Path,
    scope?: ConfigurationScope,
  ): GetFieldType<CursorlessConfiguration, Path> {
    return get(this.configuration, path) as GetFieldType<
      CursorlessConfiguration,
      Path
    >;
  }

  onDidChangeConfiguration = this.notifier.registerListener;

  updateConfiguration(configuration: CursorlessConfiguration) {
    this.configuration = configuration;
    this.notifier.notifyListeners();
  }
}

export function createJetbrainsConfiguration(
  configuration: CursorlessConfiguration,
): JetbrainsConfiguration {
  return new JetbrainsConfiguration(configuration);
}

/**
 * Gets a configuration value from jetbrains, with supported variables expanded.
 * For example, `${userHome}` will be expanded to the user's home directory.
 *
 * We currently only support `${userHome}`.
 *
 * @param path The path to the configuration value, eg `cursorless.snippetsDir`
 * @returns The configuration value, with variables expanded, or undefined if
 * the value is not set
 */
export function jetbrainsGetConfigurationString(
  path: string,
): string | undefined {
  const index = path.lastIndexOf(".");
  const section = path.substring(0, index);
  const field = path.substring(index + 1);
  //   const value = "jetbrains.workspace.getConfiguration(section).get<string>(field)";
  //   return value != null ? evaluateStringVariables(value) : undefined;
  return undefined;
}

function evaluateStringVariables(value: string): string {
  return value.replace(/\${(\w+)}/g, (match, variable) => {
    switch (variable) {
      case "userHome":
        return "~/";
      default:
        throw Error(`Unknown jetbrains configuration variable '${variable}'`);
    }
  });
}
