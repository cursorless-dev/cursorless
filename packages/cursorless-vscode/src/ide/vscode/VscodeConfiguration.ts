import * as os from "node:os";
import { HatStability } from "@cursorless/common";
import * as vscode from "vscode";
import {
  Configuration,
  ConfigurationScope,
  CursorlessConfiguration,
} from "@cursorless/common";
import { GetFieldType, Paths } from "@cursorless/common";
import { Notifier } from "@cursorless/common";
import type { VscodeIDE } from "./VscodeIDE";

type TranslatorMap = {
  [K in Paths<CursorlessConfiguration>]?: (
    arg: any,
  ) => GetFieldType<CursorlessConfiguration, K>;
};

const translators: TranslatorMap = {
  ["experimental.hatStability"]: (value: string) => {
    return HatStability[value as keyof typeof HatStability];
  },
  ["experimental.snippetsDir"]: (value?: string) => {
    return value != null ? evaluateStringVariables(value) : undefined;
  },
};

export default class VscodeConfiguration implements Configuration {
  private notifier = new Notifier();

  constructor(ide: VscodeIDE) {
    this.onDidChangeConfiguration = this.onDidChangeConfiguration.bind(this);

    ide.disposeOnExit(
      vscode.workspace.onDidChangeConfiguration(this.notifier.notifyListeners),
    );
  }

  getOwnConfiguration<Path extends Paths<CursorlessConfiguration>>(
    path: Path,
    scope?: ConfigurationScope,
  ): GetFieldType<CursorlessConfiguration, Path> {
    const rawValue = vscode.workspace
      .getConfiguration("cursorless", scope)
      .get<GetFieldType<CursorlessConfiguration, Path>>(path)!;

    return translators[path]?.(rawValue) ?? rawValue;
  }

  onDidChangeConfiguration = this.notifier.registerListener;
}

/**
 * Gets a configuration value from vscode, with supported variables expanded.
 * For example, `${userHome}` will be expanded to the user's home directory.
 *
 * We currently only support `${userHome}`.
 *
 * @param path The path to the configuration value, eg `cursorless.snippetsDir`
 * @returns The configuration value, with variables expanded, or undefined if
 * the value is not set
 */
export function vscodeGetConfigurationString(path: string): string | undefined {
  const index = path.lastIndexOf(".");
  const section = path.substring(0, index);
  const field = path.substring(index + 1);
  const value = vscode.workspace.getConfiguration(section).get<string>(field);
  return value != null ? evaluateStringVariables(value) : undefined;
}

function evaluateStringVariables(value: string): string {
  return value.replace(/\${(\w+)}/g, (match, variable) => {
    switch (variable) {
      case "userHome":
        return os.homedir();
      default:
        throw Error(`Unknown vscode configuration variable '${variable}'`);
    }
  });
}
