import { FlashStyle, Position, Range, TextEditor } from "@cursorless/common";
import { flatten, zip } from "lodash";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateRanges } from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import { Edit } from "../typings/Types";
import { Target } from "../typings/target.types";
import { flashTargets, runOnTargetsForEachEditor } from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";

export default class BrakeLine {
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
    const position = range.start;
    const line = document.lineAt(position);
    const indentation = line.text.slice(
      0,
      line.firstNonWhitespaceCharacterIndex,
    );
    const characterTrailingWhitespace = line.text
      .slice(0, position.character)
      .search(/\s+$/);
    const replacementRange =
      characterTrailingWhitespace > -1
        ? new Range(
            new Position(line.lineNumber, characterTrailingWhitespace),
            position,
          )
        : position.toEmptyRange();

    edits.push({
      range: replacementRange,
      text: "\n" + indentation,
      isReplace: !replacementRange.isEmpty,
    });
  }

  return edits;
}
