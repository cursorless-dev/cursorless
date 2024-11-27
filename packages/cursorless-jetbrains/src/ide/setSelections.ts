import type { Selection, TextDocument } from "@cursorless/common";
import type { Jetbrains } from "../types/jetbrains.types";
import { JetbrainsClient } from "./JetbrainsClient";
import { SetSelection } from "../../../cursorless-engine/src/actions/SetSelection";

export function setSelections(
  client: JetbrainsClient,
  document: TextDocument,
  editorId: string,
  selections: Selection[],
): Promise<void> {
  console.log("setSelections: " + selections);
  const selectionsJson = JSON.stringify(selections);
  console.log("setSelections JSON: " + selectionsJson);
  client.setSelection(editorId, selectionsJson);
  //jetbrains.actions.user.cursorless_everywhere_set_selections(selectionOffsets);

  return Promise.resolve();
}
