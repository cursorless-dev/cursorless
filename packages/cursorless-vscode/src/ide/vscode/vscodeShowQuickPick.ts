import type { QuickPickOptions } from "@cursorless/common";
import * as vscode from "vscode";

/**
 * Show a quick pick that allows the user to enter a new value.  We do this by
 * adding a new dummy item to the list as the user is typing.  If they select
 * the dummy item, we return the value they typed.  It is up to the client to
 * detect that it is an unknown value and handle that case.
 *
 * Based on https://stackoverflow.com/a/69842249
 */

interface CustomQuickPickItem extends vscode.QuickPickItem {
  value: string;
}

export function vscodeShowQuickPick(
  items: readonly string[],
  options: QuickPickOptions | undefined,
) {
  return new Promise<string | undefined>((resolve, _reject) => {
    const quickPick = vscode.window.createQuickPick<CustomQuickPickItem>();

    const quickPickItems = items.map((item) => ({
      label: item,
      value: item,
    }));

    quickPick.items = quickPickItems;

    if (options?.title != null) {
      quickPick.title = options.title;
    }

    if (options?.defaultValue != null) {
      const activeItem = quickPickItems.find(
        (item) => item.value === options.defaultValue,
      );
      if (activeItem != null) {
        quickPick.activeItems = [activeItem];
      }
    }

    if (options?.unknownValues) {
      const newValueTemplate =
        typeof options.unknownValues === "string"
          ? options.unknownValues
          : "Add new value '{}' →";

      quickPick.onDidChangeValue(() => {
        const value = quickPick.value.trim();
        quickPick.items =
          value === "" || items.includes(value)
            ? quickPickItems
            : [
                ...quickPickItems,
                {
                  label: newValueTemplate.replace("{}", value),
                  value,
                },
              ];
      });
    }

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
