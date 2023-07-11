import {
  InsertionMode,
  Range,
  Selection,
  TextEditor,
} from "@cursorless/common";
import { EditWithRangeUpdater } from "../../typings/Types";
import { Destination, EditNewActionType } from "../../typings/target.types";
import NotebookCellTarget from "./NotebookCellTarget";

export default class NotebookCellDestination implements Destination {
  constructor(
    public target: NotebookCellTarget,
    public insertionMode: InsertionMode,
  ) {}

  get editor(): TextEditor {
    return this.target.editor;
  }

  get contentRange(): Range {
    return this.target.contentRange;
  }

  get contentSelection(): Selection {
    return this.target.contentSelection;
  }

  get insertionDelimiter(): string {
    return this.target.insertionDelimiter;
  }

  get isRaw(): boolean {
    return this.target.isRaw;
  }

  getEditNewActionType(): EditNewActionType {
    throw new Error("Method not implemented.");
  }

  constructChangeEdit(_text: string): EditWithRangeUpdater {
    throw new Error("Method not implemented.");
  }
}
