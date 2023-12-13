import { VscodeApi } from "@cursorless/vscode-common";
import { env, window, workspace, Disposable } from "vscode";

/**
 * A very thin wrapper around the VSCode API that allows us to mock it for
 * testing. This is necessary because the test harness gets bundled separately
 * from the extension code, so if we just import the VSCode API directly from
 * the extension code, and from the test harness, we'll end up with two copies
 * of the VSCode API, so the mocks won't work.
 */
export const vscodeApi: VscodeApi = {
  window,
  env,

  workspace: {
    getConfiguration,
    watchConfiguration,
    onDidChangeConfiguration,
  },

  editor: {
    setDecorations(editor, ...args) {
      return editor.setDecorations(...args);
    },
  },
};

function getConfiguration<T>(configuration: string): T | undefined {
  if (configuration.includes(".")) {
    const sections = configuration.split(".");
    const section = sections.slice(0, -1).join(".");
    const sectionName = sections[sections.length - 1];
    return workspace.getConfiguration(section).get(sectionName);
  }

  return workspace.getConfiguration().get(configuration);
}

function watchConfiguration<T>(
  configuration: string,
  callback: (value: T | undefined) => void,
): Disposable {
  return workspace.onDidChangeConfiguration(({ affectsConfiguration }) => {
    if (affectsConfiguration(configuration)) {
      callback(getConfiguration(configuration));
    }
  });
}

function onDidChangeConfiguration(
  configuration: string | string[],
  callback: () => void,
): Disposable {
  return workspace.onDidChangeConfiguration(({ affectsConfiguration }) => {
    if (Array.isArray(configuration)) {
      if (configuration.some((section) => affectsConfiguration(section))) {
        callback();
      }
    } else if (affectsConfiguration(configuration)) {
      callback();
    }
  });
}
