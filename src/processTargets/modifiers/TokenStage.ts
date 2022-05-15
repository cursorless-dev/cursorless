import { Range, TextEditor } from "vscode";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
  Target,
} from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target {
    return {
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange: target.contentRange,
      ...getTokenContext(target.editor, target.contentRange),
    };
  }
}

export function getTokenContext(
  editor: TextEditor,
  range: Range
): Partial<Target> {
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
    removalRange: undefined,
    interiorRange: undefined,
    boundary: undefined,
    leadingDelimiterRange: isInDelimitedList
      ? leadingDelimiterRange
      : undefined,
    trailingDelimiterRange: isInDelimitedList
      ? trailingDelimiterRange
      : undefined,
  };
}
