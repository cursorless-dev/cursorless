import { EditableTextEditor, FlashStyle, TextEditor } from "@cursorless/common";
import { flatten } from "lodash";
import { selectionToThatTarget } from "../core/commandRunner/selectionToThatTarget";
import { callFunctionAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Graph";
import {
  setSelectionsAndFocusEditor,
  setSelectionsWithoutFocusingEditor,
} from "../util/setSelectionsAndFocusEditor";
import {
  ensureSingleEditor,
  ensureSingleTarget,
  flashTargets,
  runOnTargetsForEachEditor,
  runOnTargetsForEachEditorSequentially,
} from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

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
export class CallbackAction implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
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
      await setSelectionsAndFocusEditor(
        editableEditor,
        targetSelections,
        false,
      );
    }

    const [updatedOriginalSelections, updatedTargetSelections] =
      await callFunctionAndUpdateSelections(
        this.graph.rangeUpdater,
        () => options.callback(editableEditor, targets),
        editor.document,
        [originalSelections, targetSelections],
      );

    // Reset original selections
    if (options.setSelection && options.restoreSelection) {
      // NB: We don't focus the editor here because we'll do that at the
      // very end. This code can run on multiple editors in the course of
      // one command, so we want to avoid focusing the editor multiple
      // times.
      setSelectionsWithoutFocusingEditor(
        editableEditor,
        updatedOriginalSelections,
      );
    }

    // If the document hasn't changed then we just return the original targets
    // so that we preserve their rich types, but if it has changed then we
    // just downgrade them to untyped targets
    return editor.document.version === originalEditorVersion
      ? targets
      : updatedTargetSelections.map((selection) =>
          selectionToThatTarget({
            editor,
            selection,
          }),
        );
  }
}
