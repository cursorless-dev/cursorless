import { flatten, zip } from "lodash-es";
import type { Edit, IDE, TextEditor } from "@cursorless/lib-common";
import { FlashStyle, Position, Range, Selection } from "@cursorless/lib-common";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import type { Target } from "../typings/target.types";
import { flashTargets, runOnTargetsForEachEditor } from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";

export class BreakLine {
  constructor(
    private ide: IDE,
    private rangeUpdater: RangeUpdater,
  ) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    await flashTargets(this.ide, targets, FlashStyle.pendingModification0);

    const thatSelections = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const contentRanges = targets.map(({ contentRange }) => contentRange);
        const edits = getEdits(editor, contentRanges);
        const editableEditor = this.ide.getEditableTextEditor(editor);

        const { contentRanges: updatedRanges } =
          await performEditsAndUpdateSelections({
            rangeUpdater: this.rangeUpdater,
            editor: editableEditor,
            edits,
            selections: {
              contentRanges,
            },
          });

        return zip(targets, updatedRanges).map(([target, range]) => ({
          editor: target!.editor,
          selection: Selection.fromRange(range!, target!.isReversed),
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
      line.rangeTrimmed?.start?.character ?? line.range.start.character,
    );
    const characterTrailingWhitespace = line.text
      .slice(0, position.character)
      .search(/\s+$/u);
    const replacementRange =
      characterTrailingWhitespace > -1
        ? new Range(
            new Position(line.lineNumber, characterTrailingWhitespace),
            position,
          )
        : Range.fromPosition(position);

    edits.push({
      range: replacementRange,
      text: `\n${indentation}`,
      isReplace: !replacementRange.isEmpty,
    });
  }

  return edits;
}
