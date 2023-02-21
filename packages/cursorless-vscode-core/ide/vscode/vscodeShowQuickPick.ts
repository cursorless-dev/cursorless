import * as vscode from "vscode";
import { QuickPickOptions, UnknownValuesOptions } from "@cursorless/common";

export async function vscodeShowQuickPick(
  items: readonly string[],
  options: QuickPickOptions | undefined,
) {
  if (options?.unknownValues == null) {
    return await vscode.window.showQuickPick(items, options);
  }

  const { unknownValues, ...rest } = options;
  return await showQuickPickAllowingUnknown(items, unknownValues, rest);
}

interface CustomQuickPickItem extends vscode.QuickPickItem {
  value: string;
}

const DEFAULT_NEW_VALUE_TEMPLATE = "Add new value '{}' →";

/**
 * Show a quick pick that allows the user to enter a new value.  We do this by
 * adding a new dummy item to the list as the user is typing.  If they select
 * the dummy item, we return the value they typed.  It is up to the client to
 * detect that it is an unknown value and handle that case.
 *
 * Based on https://stackoverflow.com/a/69842249
 * @param items
 * @param options
 */
function showQuickPickAllowingUnknown(
  choices: readonly string[],
  unknownValues: UnknownValuesOptions,
  options: vscode.QuickPickOptions,
) {
  return new Promise<string | undefined>((resolve, _reject) => {
    const quickPick = vscode.window.createQuickPick<CustomQuickPickItem>();
    const quickPickItems = choices.map((choice) => ({
      label: choice,
      value: choice,
    }));
    quickPick.items = quickPickItems;

    if (options.title != null) {
      quickPick.title = options.title;
    }

    const { newValueTemplate = DEFAULT_NEW_VALUE_TEMPLATE } = unknownValues;

    quickPick.onDidChangeValue(() => {
      quickPick.items = [
        ...quickPickItems,

        // INJECT user values into proposed values
        ...(choices.includes(quickPick.value)
          ? []
          : [
              {
                label: newValueTemplate.replace("{}", quickPick.value),
                value: quickPick.value,
              },
            ]),
      ];
    });

    quickPick.onDidAccept(() => {
      const selection = quickPick.activeItems[0];
      resolve(selection.value);
      quickPick.hide();
    });

    quickPick.onDidHide(() => {
      resolve(undefined);
    });

    quickPick.show();
  });
}
