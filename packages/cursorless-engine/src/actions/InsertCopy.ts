import {
  FlashStyle,
  RangeExpansionBehavior,
  Selection,
  TextEditor,
  toCharacterRange,
} from "@cursorless/common";
import { flatten, zip } from "lodash";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelectionsWithBehavior } from "../core/updateSelections/updateSelections";
import { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { containingLineIfUntypedModifier } from "../processTargets/modifiers/commonContainingScopeIfUntypedModifiers";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { setSelectionsWithoutFocusingEditor } from "../util/setSelectionsAndFocusEditor";
import { createThatMark, runOnTargetsForEachEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

class InsertCopy implements Action {
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

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
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
      target.toPositionTarget(position).constructChangeEdit(target.contentText),
    );

    const cursorSelections = { selections: editor.selections };
    const contentSelections = {
      selections: targets.map(({ contentSelection }) => contentSelection),
    };
    const editSelections = {
      selections: edits.map(
        ({ range }) => new Selection(range.start, range.end),
      ),
      rangeBehavior: RangeExpansionBehavior.openOpen,
    };

    const editableEditor = ide().getEditableTextEditor(editor);

    const [
      updatedEditorSelections,
      updatedContentSelections,
      updatedEditSelections,
    ]: Selection[][] = await performEditsAndUpdateSelectionsWithBehavior(
      this.rangeUpdater,
      editableEditor,
      edits,
      [cursorSelections, contentSelections, editSelections],
    );

    const insertionRanges = zip(edits, updatedEditSelections).map(
      ([edit, selection]) => edit!.updateRange(selection!),
    );

    setSelectionsWithoutFocusingEditor(editableEditor, updatedEditorSelections);
    await editableEditor.revealRange(editor.selections[0]);

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
