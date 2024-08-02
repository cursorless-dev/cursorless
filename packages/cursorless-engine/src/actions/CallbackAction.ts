import type { EditableTextEditor, TextEditor } from "@cursorless/common";
import { FlashStyle } from "@cursorless/common";
import { flatten } from "lodash-es";
import { selectionToStoredTarget } from "../core/commandRunner/selectionToStoredTarget";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import type { Target } from "../typings/target.types";
import {
  ensureSingleEditor,
  ensureSingleTarget,
  flashTargets,
  runOnTargetsForEachEditor,
  runOnTargetsForEachEditorSequentially,
} from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";

interface CallbackOptions {
  callback: (editor: EditableTextEditor, targets: Target[]) => Promise<void>;
  ensureSingleEditor: boolean;
  ensureSingleTarget: boolean;
  setSelection: boolean;
  restoreSelection: boolean;
  showDecorations: boolean;
}

/**
 * This is a helper action that is used internally to implement various actions.
 * It takes a {@link CallbackOptions.callback callback} that is called once for
 * each editor, receiving all the targets that are in the given editor.
 */
export class CallbackAction {
  constructor(private rangeUpdater: RangeUpdater) {
    this.run = this.run.bind(this);
  }

  async run(
    targets: Target[],
    options: CallbackOptions,
  ): Promise<ActionReturnValue> {
    if (options.showDecorations) {
      await flashTargets(ide(), targets, FlashStyle.referenced);
    }

    if (options.ensureSingleEditor) {
      ensureSingleEditor(targets);
    }

    if (options.ensureSingleTarget) {
      ensureSingleTarget(targets);
    }

    const originalEditor = ide().activeEditableTextEditor;

    // If we are relying on selections we have to wait for one editor to finish
    // before moving the selection to the next
    const runOnTargets = options.setSelection
      ? runOnTargetsForEachEditorSequentially
      : runOnTargetsForEachEditor;

    const thatTargets = flatten(
      await runOnTargets(targets, (editor, targets) =>
        this.runForEditor(options, editor, targets),
      ),
    );

    // If necessary focus back original editor
    if (
      options.setSelection &&
      options.restoreSelection &&
      originalEditor != null &&
      !originalEditor.isActive
    ) {
      // NB: We just do one editor focus at the end, instead of using
      // setSelectionsAndFocusEditor because the command might operate on
      // multiple editors, so we just do one focus at the end.
      await originalEditor.focus();
    }

    return { thatTargets };
  }

  private async runForEditor(
    options: CallbackOptions,
    editor: TextEditor,
    targets: Target[],
  ): Promise<Target[]> {
    const editableEditor = ide().getEditableTextEditor(editor);
    const originalSelections = editor.selections;
    const originalEditorVersion = editor.document.version;
    const targetSelections = targets.map((target) => target.contentSelection);

    // For this callback/command to the work we have to have the correct editor focused
    if (options.setSelection) {
      await editableEditor.setSelections(targetSelections, {
        focusEditor: true,
        revealRange: false,
      });
    }

    const {
      originalSelections: updatedOriginalSelections,
      targetSelections: updatedTargetSelections,
    } = await performEditsAndUpdateSelections({
      rangeUpdater: this.rangeUpdater,
      editor: editableEditor,
      callback: () => options.callback(editableEditor, targets),
      preserveCursorSelections: true,
      selections: {
        originalSelections,
        targetSelections,
      },
    });

    // Reset original selections
    if (options.setSelection && options.restoreSelection) {
      // NB: We don't focus the editor here because we'll do that at the
      // very end. This code can run on multiple editors in the course of
      // one command, so we want to avoid focusing the editor multiple
      // times.
      await editableEditor.setSelections(updatedOriginalSelections);
    }

    // If the document hasn't changed then we just return the original targets
    // so that we preserve their rich types, but if it has changed then we
    // just downgrade them to untyped targets
    return editor.document.version === originalEditorVersion
      ? targets
      : updatedTargetSelections.map((selection) =>
          selectionToStoredTarget({
            editor,
            selection,
          }),
        );
  }
}
