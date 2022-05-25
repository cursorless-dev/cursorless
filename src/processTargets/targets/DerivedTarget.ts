import { Range } from "vscode";
import { EditNewContext, Position, Target } from "../../typings/target.types";

export default class DerivedTarget implements Target {
  constructor(private target: Target, private weakTarget: Target) {}

  get editor() {
    return this.target.editor;
  }
  get isReversed() {
    return this.target.isReversed;
  }
  get contentRange() {
    return this.target.contentRange;
  }
  get delimiter() {
    return this.target.delimiter;
  }
  get removalRange() {
    return this.target.removalRange;
  }
  get leadingDelimiter() {
    return this.target.leadingDelimiter;
  }
  get trailingDelimiter() {
    return this.target.trailingDelimiter;
  }
  get position() {
    return this.target.position;
  }
  get isLine() {
    return this.target.isLine;
  }
  get isParagraph() {
    return this.target.isParagraph;
  }
  get isWeak() {
    return this.target.isWeak;
  }
  get contentText() {
    return this.target.contentText;
  }
  get contentSelection() {
    return this.target.contentSelection;
  }
  getInteriorStrict(): Target[] {
    return this.target.getInteriorStrict();
  }
  getBoundaryStrict(): Target[] {
    return this.target.getBoundaryStrict();
  }
  maybeAddDelimiter(text: string): string {
    return this.target.maybeAddDelimiter(text);
  }
  getRemovalRange(): Range {
    return this.target.getRemovalRange();
  }
  getRemovalHighlightRange(): Range | undefined {
    return this.target.getRemovalHighlightRange();
  }
  getEditNewContext(isBefore: boolean): EditNewContext {
    return this.target.getEditNewContext(isBefore);
  }
  withPosition(position: Position): Target {
    return this.target.withPosition(position);
  }

  getThatTarget() {
    return this.weakTarget;
  }
}
