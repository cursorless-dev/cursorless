import { Range, TextEditor } from "vscode";
import { ContainingScopeModifier } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  run(
    context: ProcessedTargetsContext,
    stage: ContainingScopeModifier,
    selection: TypedSelection
  ): TypedSelection {
    return {
      ...selection,
      ...this.getDelimiterRanges(selection.editor, selection.contentRange),
    };
  }

  getDelimiterRanges(editor: TextEditor, range: Range) {
    const document = editor.document;
    const { start, end } = range;
    const endLine = document.lineAt(end);
    let leadingDelimiterRange, trailingDelimiterRange;

    const startLine = document.lineAt(start);
    const leadingText = startLine.text.slice(0, start.character);
    const leadingDelimiters = leadingText.match(/\s+$/);
    leadingDelimiterRange =
      leadingDelimiters != null
        ? new Range(
            start.line,
            start.character - leadingDelimiters[0].length,
            start.line,
            start.character
          )
        : undefined;

    const trailingText = endLine.text.slice(end.character);
    const trailingDelimiters = trailingText.match(/^\s+/);
    trailingDelimiterRange =
      trailingDelimiters != null
        ? new Range(
            end.line,
            end.character,
            end.line,
            end.character + trailingDelimiters[0].length
          )
        : undefined;

    const isInDelimitedList =
      (leadingDelimiterRange != null || trailingDelimiterRange != null) &&
      (leadingDelimiterRange != null || start.character === 0) &&
      (trailingDelimiterRange != null || end.isEqual(endLine.range.end));

    return {
      delimiter: " ",
      leadingDelimiterRange: isInDelimitedList
        ? leadingDelimiterRange
        : undefined,
      trailingDelimiterRange: isInDelimitedList
        ? trailingDelimiterRange
        : undefined,
    };
  }
}
