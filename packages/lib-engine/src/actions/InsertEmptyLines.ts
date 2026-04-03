import type { IDE, InsertionMode } from "@cursorless/lib-common";
import {
  FlashStyle,
  RangeExpansionBehavior,
  toCharacterRange,
  toLineRange,
  zipStrict,
} from "@cursorless/lib-common";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { containingLineIfUntypedModifier } from "../processTargets/modifiers/commonContainingScopeIfUntypedModifiers";
import type { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import type { ModifierStage } from "../processTargets/PipelineStages.types";
import type { Target } from "../typings/target.types";
import type { EditWithRangeUpdater as EditWithRangeType } from "../typings/Types";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import type { ActionReturnValue, SimpleAction } from "./actions.types";

interface EditWithFlashType extends EditWithRangeType {
  isLine: boolean;
}

/** NB: this now also inserts insertion delimiters where appropriate, not just empty lines */
abstract class InsertEmptyLines implements SimpleAction {
  getFinalStages(): ModifierStage[] {
    return [this.modifierStageFactory.create(containingLineIfUntypedModifier)];
  }

  constructor(
    private ide: IDE,
    private rangeUpdater: RangeUpdater,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    const results = await runOnTargetsForEachEditor(
      targets,
      async (editor, targets) => {
        const edits = this.getEdits(targets);
        const contentSelections = targets.map(
          (target) => target.thatTarget.contentSelection,
        );

        const {
          contentSelections: updatedThatSelections,
          editRanges: updatedEditRanges,
        } = await performEditsAndUpdateSelections({
          rangeUpdater: this.rangeUpdater,
          editor: this.ide.getEditableTextEditor(editor),
          edits,
          selections: {
            contentSelections,
            editRanges: {
              selections: edits.map((edit) => edit.range),
              behavior: RangeExpansionBehavior.openOpen,
            },
          },
        });

        return {
          thatMark: updatedThatSelections.map((selection) => ({
            editor,
            selection,
          })),
          flashRanges: zipStrict(edits, updatedEditRanges).map(
            ([edit, editRange]) => ({
              editor,
              // Exclude the new line delimiter from the range for line edits
              range: edit.isLine ? edit.updateRange(editRange) : editRange,
              isLine: edit.isLine,
            }),
          ),
        };
      },
    );

    await this.ide.flashRanges(
      results.flatMap((result) =>
        result.flashRanges.map(({ editor, range, isLine }) => ({
          editor,
          range: isLine ? toLineRange(range) : toCharacterRange(range),
          style: FlashStyle.justAdded,
        })),
      ),
    );

    const thatMark = results.flatMap((result) => result.thatMark);

    return { thatSelections: thatMark };
  }

  protected abstract getEdits(targets: Target[]): EditWithFlashType[];
}

export class InsertEmptyLinesAround extends InsertEmptyLines {
  protected getEdits(targets: Target[]) {
    return targets.flatMap((target) => [
      constructChangeEdit(target, "before"),
      constructChangeEdit(target, "after"),
    ]);
  }
}

export class InsertEmptyLineAbove extends InsertEmptyLines {
  protected getEdits(targets: Target[]) {
    return targets.map((target) => constructChangeEdit(target, "before"));
  }
}

export class InsertEmptyLineBelow extends InsertEmptyLines {
  protected getEdits(targets: Target[]) {
    return targets.map((target) => constructChangeEdit(target, "after"));
  }
}

function constructChangeEdit(
  target: Target,
  insertionMode: InsertionMode,
): EditWithFlashType {
  return {
    ...target.toDestination(insertionMode).constructChangeEdit("", true),
    isLine: target.textualType === "line",
  };
}
