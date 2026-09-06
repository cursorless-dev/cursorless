import type { IDE } from "@cursorless/lib-common";

export function getActiveSelections(ide: IDE) {
  return (
    ide.activeTextEditor?.selections.map((selection) => ({
      selection,
      editor: ide.activeTextEditor!,
    })) ?? []
  );
}
