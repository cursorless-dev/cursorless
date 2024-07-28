import {
  FlashStyle,
  RangeExpansionBehavior,
  TextEditor,
  toCharacterRange,
} from "@cursorless/common";
import { flatten, zip } from "lodash-es";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { containingLineIfUntypedModifier } from "../processTargets/modifiers/commonContainingScopeIfUntypedModifiers";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { createThatMark, runOnTargetsForEachEditor } from "../util/targetUtils";
import { ActionReturnValue, SimpleAction } from "./actions.types";

class InsertCopy implements SimpleAction {
  getFinalStages = () => [
    this.modifierStageFactory.create(containingLineIfUntypedModifier),
  ];

  constructor(
    private rangeUpdater: RangeUpdater,
    private modifierStageFactory: ModifierStageFactory,
    private isBefore: boolean,
  ) {
    this.run = this.run.bind(this);
    this.runForEditor = this.runForEditor.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    const results = flatten(
      await runOnTargetsForEachEditor(targets, this.runForEditor),
    );

    await ide().flashRanges(
      results.flatMap((result) =>
        result.thatMark.map((that) => ({
          editor: that.editor,
          range: toCharacterRange(that.selection),
          style: FlashStyle.justAdded,
        })),
      ),
    );

    return {
      sourceSelections: results.flatMap(({ sourceMark }) => sourceMark),
      thatSelections: results.flatMap(({ thatMark }) => thatMark),
    };
  }

  private async runForEditor(editor: TextEditor, targets: Target[]) {
    // isBefore is inverted because we want the selections to stay with what is to the user the "copy"
    const position = this.isBefore ? "after" : "before";
    const edits = targets.flatMap((target) =>
      target.toDestination(position).constructChangeEdit(target.contentText),
    );
    const contentSelections = targets.map(
      ({ contentSelection }) => contentSelection,
    );
    const editRanges = edits.map(({ range }) => range);
    const editableEditor = ide().getEditableTextEditor(editor);

    const {
      contentSelections: updatedContentSelections,
      editRanges: updatedEditRanges,
    } = await performEditsAndUpdateSelections({
      rangeUpdater: this.rangeUpdater,
      editor: editableEditor,
      edits,
      selections: {
        contentSelections,
        editRanges: {
          selections: editRanges,
          behavior: RangeExpansionBehavior.openOpen,
        },
      },
    });

    const insertionRanges = zip(edits, updatedEditRanges).map(([edit, range]) =>
      edit!.updateRange(range!),
    );

    const primarySelection = editor.selections[0];

    if (
      updatedContentSelections.some(
        (selection) => selection.intersection(primarySelection) != null,
      )
    ) {
      // If the original target contained the user's cursor, reveal it in case it got pushed off screen
      await editableEditor.revealRange(primarySelection);
    }

    return {
      sourceMark: createThatMark(targets, insertionRanges),
      thatMark: createThatMark(targets, updatedContentSelections),
    };
  }
}

export class CopyContentBefore extends InsertCopy {
  constructor(
    rangeUpdater: RangeUpdater,
    modifierStageFactory: ModifierStageFactory,
  ) {
    super(rangeUpdater, modifierStageFactory, true);
  }
}

export class CopyContentAfter extends InsertCopy {
  constructor(
    rangeUpdater: RangeUpdater,
    modifierStageFactory: ModifierStageFactory,
  ) {
    super(rangeUpdater, modifierStageFactory, false);
  }
}
