import type { TextEditor } from "../..";
import type { GeneralizedRange } from "../../types/GeneralizedRange";

export enum FlashStyle {
  pendingDelete = "pendingDelete",
  referenced = "referenced",
  pendingModification0 = "pendingModification0",
  pendingModification1 = "pendingModification1",
  justAdded = "justAdded",
}

export interface FlashDescriptor {
  style: FlashStyle;
  editor: TextEditor;
  range: GeneralizedRange;
}
