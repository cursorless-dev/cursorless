import type { IDE } from "@cursorless/common";

export function getActiveSelections(ide: IDE) {
  return (
    ide.activeTextEditor?.selections.map((selection) => ({
      selection,
      editor: ide.activeTextEditor!,
    })) ?? []
  );
}
