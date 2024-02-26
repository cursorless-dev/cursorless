import type { Disposable } from "vscode";
import { vscodeApi } from "./vscodeApi";

export function getConfiguration<T>(configuration: string): T | undefined {
  if (configuration.includes(".")) {
    const sections = configuration.split(".");
    const section = sections.slice(0, -1).join(".");
    const sectionName = sections[sections.length - 1];
    return vscodeApi.workspace.getConfiguration(section).get(sectionName);
  }

  return vscodeApi.workspace.getConfiguration().get(configuration);
}

export function watchConfiguration<T>(
  configuration: string,
  callback: (value: T | undefined) => void,
): Disposable {
  return vscodeApi.workspace.onDidChangeConfiguration(
    ({ affectsConfiguration }) => {
      if (affectsConfiguration(configuration)) {
        callback(getConfiguration(configuration));
      }
    },
  );
}

export function onDidChangeConfiguration(
  configuration: string | string[],
  callback: () => void,
): Disposable {
  return vscodeApi.workspace.onDidChangeConfiguration(
    ({ affectsConfiguration }) => {
      if (Array.isArray(configuration)) {
        if (configuration.some((section) => affectsConfiguration(section))) {
          callback();
        }
      } else if (affectsConfiguration(configuration)) {
        callback();
      }
    },
  );
}
