import { FlashStyle, Range, TextEditor } from "@cursorless/common";
import { flatten, zip } from "lodash";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateRanges } from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import { Edit } from "../typings/Types";
import { Target } from "../typings/target.types";
import { flashTargets, runOnTargetsForEachEditor } from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";

export default class JoinLines {
  constructor(private rangeUpdater: RangeUpdater) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    await flashTargets(ide(), targets, FlashStyle.pendingModification0);

    const thatSelections = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const contentRanges = targets.map(({ contentRange }) => contentRange);
        const edits = getEdits(editor, contentRanges);

        const [updatedRanges] = await performEditsAndUpdateRanges(
          this.rangeUpdater,
          ide().getEditableTextEditor(editor),
          edits,
          [contentRanges],
        );

        return zip(targets, updatedRanges).map(([target, range]) => ({
          editor: target!.editor,
          selection: range!.toSelection(target!.isReversed),
        }));
      }),
    );

    return { thatSelections };
  }
}

function getEdits(editor: TextEditor, contentRanges: Range[]): Edit[] {
  const { document } = editor;
  const edits: Edit[] = [];

  for (const range of contentRanges) {
    const startLine = range.start.line;
    const endLine = range.isSingleLine ? startLine + 1 : range.end.line;
    let prevLine = document.lineAt(startLine);

    for (let i = startLine + 1; i <= endLine && i < document.lineCount; ++i) {
      const nextLine = document.lineAt(i);
      const start = prevLine.range.end;
      const end = nextLine.range.start;

      edits.push({
        range: new Range(start, end),
        text:
          prevLine.lastNonWhitespaceCharacterIndex < start.character ||
          nextLine.firstNonWhitespaceCharacterIndex > end.character
            ? ""
            : " ",
        isReplace: true,
      });

      prevLine = nextLine;
    }
  }

  return edits;
}
