import { Range } from "vscode";
import { Target } from "../../../typings/target.types";
import RawSelectionTarget from "../../targets/RawSelectionTarget";
import DelimitedSequenceInsertionRemovalBehavior from "./DelimitedSequenceInsertionRemovalBehavior";
import InsertionRemovalBehavior from "./insertionRemovalBehavior.types";

export default class TokenInsertionRemovalBehavior
  implements InsertionRemovalBehavior
{
  private delimitedSequenceInsertionRemovalBehavior: DelimitedSequenceInsertionRemovalBehavior;

  delimiterString = " ";

  constructor(private target: Target) {
    this.delimitedSequenceInsertionRemovalBehavior =
      new DelimitedSequenceInsertionRemovalBehavior(target, {
        delimiterString: this.delimiterString,
        getLeadingDelimiterTarget: () => this.getLeadingDelimiterTarget(),
        getTrailingDelimiterTarget: () => this.getTrailingDelimiterTarget(),
      });
  }

  getLeadingDelimiterTarget() {
    const { editor } = this.target;
    const { start } = this.target.contentRange;

    const startLine = editor.document.lineAt(start);
    const leadingText = startLine.text.slice(0, start.character);
    const leadingDelimiters = leadingText.match(/\s+$/);

    return leadingDelimiters == null
      ? undefined
      : new RawSelectionTarget({
          contentRange: new Range(
            start.line,
            start.character - leadingDelimiters[0].length,
            start.line,
            start.character
          ),
          editor,
          isReversed: false,
        });
  }

  getTrailingDelimiterTarget() {
    const { editor } = this.target;
    const { end } = this.target.contentRange;

    const endLine = editor.document.lineAt(end);
    const trailingText = endLine.text.slice(end.character);
    const trailingDelimiters = trailingText.match(/^\s+/);

    return trailingDelimiters == null
      ? undefined
      : new RawSelectionTarget({
          contentRange: new Range(
            end.line,
            end.character,
            end.line,
            end.character + trailingDelimiters[0].length
          ),
          editor,
          isReversed: false,
        });
  }

  getRemovalRange(): Range {
    const { start, end } = this.target.contentRange;
    const endLine = this.target.editor.document.lineAt(end);

    const leadingDelimiterTarget = this.getLeadingDelimiterTarget();
    const trailingDelimiterTarget = this.getTrailingDelimiterTarget();

    // If there is a token directly to the left or right of us with no
    // separating white space, then we might join two tokens if we try to clean
    // up whitespace space. In this case we just remove the content range
    // without attempting to clean up white space.
    //
    // In the future, we might get more sophisticated and to clean up white space if we can detect that it won't cause two tokens be merged
    if (
      (leadingDelimiterTarget == null && start.character !== 0) ||
      (trailingDelimiterTarget == null && !end.isEqual(endLine.range.end))
    ) {
      return this.target.contentRange;
    }

    // Otherwise, behave like a whitespace delimited sequence
    return this.delimitedSequenceInsertionRemovalBehavior.getRemovalRange();
  }
}
