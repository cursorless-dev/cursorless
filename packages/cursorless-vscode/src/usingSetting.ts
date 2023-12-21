import { vscodeApi } from "./vscodeApi";
import { Disposable } from "@cursorless/common";

/**
 * Watches for changes to a setting and calls a factory function whenever the
 * setting changes, disposing of any disposables created by the factory. On the
 * initial call, the factory function is called immediately.
 *
 * @param section The section of the setting
 * @param setting The setting
 * @param factory A function that takes the setting value and returns a disposable
 * @returns A disposable that disposes of the setting listener and any disposables created by the factory
 */
export function usingSetting<T>(
  section: string,
  setting: string,
  factory: (value: T) => Disposable,
): Disposable {
  const fullFactory = () =>
    factory(vscodeApi.workspace.getConfiguration(section).get<T>(setting)!);

  let disposable = fullFactory();
  const configurationDisposable = vscodeApi.workspace.onDidChangeConfiguration(
    ({ affectsConfiguration }) => {
      if (affectsConfiguration(`${section}.${setting}`)) {
        disposable.dispose();
        disposable = fullFactory();
      }
    },
  );

  return {
    dispose: () => {
      disposable.dispose();
      configurationDisposable.dispose();
    },
  };
}
