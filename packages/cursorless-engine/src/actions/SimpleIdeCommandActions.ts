import { CommandId, EditableTextEditor, Range } from "@cursorless/common";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { CallbackAction } from "./CallbackAction";
import { ActionReturnValue } from "./actions.types";

interface Options {
  showDecorations?: boolean;
}

/**
 * This is the base class for actions that simply call an ide command on the
 * target. It includes machinery to automatically jump to the target if the
 * editor does not support running the command directly on a target without
 * moving the cursor. Note that most of the heavy lifting is done by
 * {@link CallbackAction}.
 */
abstract class SimpleIdeCommandAction {
  private callbackAction: CallbackAction;

  abstract command: CommandId;
  ensureSingleEditor: boolean = false;
  ensureSingleTarget: boolean = false;
  restoreSelection: boolean = true;
  showDecorations: boolean = true;

  constructor(rangeUpdater: RangeUpdater) {
    this.callbackAction = new CallbackAction(rangeUpdater);
    this.run = this.run.bind(this);
  }

  async run(
    targets: [Target[]],
    { showDecorations }: Options = {},
  ): Promise<ActionReturnValue> {
    const capabilities = ide().capabilities.commands[this.command];

    if (capabilities == null) {
      throw Error(`Action ${this.command} is not supported by your ide`);
    }

    const { acceptsLocation } = capabilities;

    return this.callbackAction.run(targets, {
      callback: (editor, targets) =>
        callback(
          editor,
          acceptsLocation ? targets.map((t) => t.contentRange) : undefined,
          this.command,
        ),
      setSelection: !acceptsLocation,
      ensureSingleEditor: this.ensureSingleEditor,
      ensureSingleTarget: this.ensureSingleTarget,
      restoreSelection: this.restoreSelection,
      showDecorations: showDecorations ?? this.showDecorations,
    });
  }
}

export class CopyToClipboard extends SimpleIdeCommandAction {
  command: CommandId = "clipboardCopy";
  ensureSingleEditor = true;
}

export class ToggleLineComment extends SimpleIdeCommandAction {
  command: CommandId = "toggleLineComment";
}

export class IndentLine extends SimpleIdeCommandAction {
  command: CommandId = "indentLine";
}

export class OutdentLine extends SimpleIdeCommandAction {
  command: CommandId = "outdentLine";
}

export class Fold extends SimpleIdeCommandAction {
  command: CommandId = "fold";
}

export class Unfold extends SimpleIdeCommandAction {
  command: CommandId = "unfold";
}

export class Rename extends SimpleIdeCommandAction {
  command: CommandId = "rename";
  ensureSingleTarget = true;
}

export class ShowReferences extends SimpleIdeCommandAction {
  command: CommandId = "showReferences";
  ensureSingleTarget = true;
}

export class ShowQuickFix extends SimpleIdeCommandAction {
  command: CommandId = "quickFix";
  ensureSingleTarget = true;
}

export class RevealDefinition extends SimpleIdeCommandAction {
  command: CommandId = "revealDefinition";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class RevealTypeDefinition extends SimpleIdeCommandAction {
  command: CommandId = "revealTypeDefinition";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class ShowHover extends SimpleIdeCommandAction {
  command: CommandId = "showHover";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class ShowDebugHover extends SimpleIdeCommandAction {
  command: CommandId = "showDebugHover";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class ExtractVariable extends SimpleIdeCommandAction {
  command: CommandId = "extractVariable";
  ensureSingleTarget = true;
  restoreSelection = false;
}

function callback(
  editor: EditableTextEditor,
  ranges: Range[] | undefined,
  command: CommandId,
): Promise<void> {
  switch (command) {
    // Multi target actions
    case "toggleLineComment":
      return editor.toggleLineComment(ranges);
    case "indentLine":
      return editor.indentLine(ranges);
    case "outdentLine":
      return editor.outdentLine(ranges);
    case "clipboardCopy":
      return editor.clipboardCopy(ranges);
    case "fold":
      return editor.fold(ranges);
    case "unfold":
      return editor.unfold(ranges);

    // Single target actions
    case "rename":
      return editor.rename(ranges?.[0]);
    case "showReferences":
      return editor.showReferences(ranges?.[0]);
    case "quickFix":
      return editor.quickFix(ranges?.[0]);
    case "revealDefinition":
      return editor.revealDefinition(ranges?.[0]);
    case "revealTypeDefinition":
      return editor.revealTypeDefinition(ranges?.[0]);
    case "showHover":
      return editor.showHover(ranges?.[0]);
    case "showDebugHover":
      return editor.showDebugHover(ranges?.[0]);
    case "extractVariable":
      return editor.extractVariable(ranges?.[0]);

    // Unsupported as simple action
    case "highlight":
      throw Error("Highlight command not supported as simple action");
  }
}
