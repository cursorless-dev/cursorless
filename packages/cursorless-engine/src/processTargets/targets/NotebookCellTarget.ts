import { InsertionMode, Range, TextEditor } from "@cursorless/common";
import { BaseTarget, CommonTargetParameters } from ".";
import { EditWithRangeUpdater } from "../../typings/Types";
import { Destination, EditNewActionType } from "../../typings/target.types";

export default class NotebookCellTarget extends BaseTarget<CommonTargetParameters> {
  type = "NotebookCellTarget";
  insertionDelimiter = "\n";
  isNotebookCell = true;

  constructor(parameters: CommonTargetParameters) {
    super(parameters);
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.contentRange;

  protected getCloneParameters() {
    return this.state;
  }

  toDestination(insertionMode: InsertionMode): Destination {
    return new NotebookCellDestination(this, insertionMode);
  }
}

export class NotebookCellDestination implements Destination {
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
