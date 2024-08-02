import type { Edit, TextEditor } from "@cursorless/common";
import { FlashStyle, Range } from "@cursorless/common";
import { range as iterRange, map, pairwise } from "itertools";
import { flatten, zip } from "lodash-es";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import type { Target } from "../typings/target.types";
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

        const { contentRanges: updatedRanges } =
          await performEditsAndUpdateSelections({
            rangeUpdater: this.rangeUpdater,
            editor: ide().getEditableTextEditor(editor),
            edits: getEdits(editor, contentRanges),
            selections: {
              contentRanges,
            },
          });

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

    const lineIter = map(iterRange(startLine, endLine + 1), (i) =>
      document.lineAt(i),
    );
    for (const [line1, line2] of pairwise(lineIter)) {
      edits.push({
        range: new Range(
          line1.range.end.line,
          line1.lastNonWhitespaceCharacterIndex,
          line2.range.start.line,
          line2.firstNonWhitespaceCharacterIndex,
        ),
        text: line2.isEmptyOrWhitespace ? "" : " ",
        isReplace: true,
      });
    }
  }

  return edits;
}
