import { CommandId, EditableTextEditor, Range } from "@cursorless/common";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { ActionReturnValue } from "./actions.types";
import { CallbackAction } from "./CallbackAction";

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
abstract class SimpleIdeCommandActions {
  private callbackAction: CallbackAction;

  abstract command: CommandId;
  ensureSingleEditor: boolean = false;
  ensureSingleTarget: boolean = false;
  restoreSelection: boolean = true;
  showDecorations: boolean = true;

  constructor(graph: Graph) {
    this.callbackAction = new CallbackAction(graph);
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

export class CopyToClipboard extends SimpleIdeCommandActions {
  command: CommandId = "clipboardCopy";
  ensureSingleEditor = true;
}

export class ToggleLineComment extends SimpleIdeCommandActions {
  command: CommandId = "toggleLineComment";
}

export class IndentLine extends SimpleIdeCommandActions {
  command: CommandId = "indentLine";
}

export class OutdentLine extends SimpleIdeCommandActions {
  command: CommandId = "outdentLine";
}

export class Fold extends SimpleIdeCommandActions {
  command: CommandId = "fold";
}

export class Unfold extends SimpleIdeCommandActions {
  command: CommandId = "unfold";
}

export class Rename extends SimpleIdeCommandActions {
  command: CommandId = "rename";
  ensureSingleTarget = true;
}

export class ShowReferences extends SimpleIdeCommandActions {
  command: CommandId = "showReferences";
  ensureSingleTarget = true;
}

export class ShowQuickFix extends SimpleIdeCommandActions {
  command: CommandId = "quickFix";
  ensureSingleTarget = true;
}

export class RevealDefinition extends SimpleIdeCommandActions {
  command: CommandId = "revealDefinition";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class RevealTypeDefinition extends SimpleIdeCommandActions {
  command: CommandId = "revealTypeDefinition";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class ShowHover extends SimpleIdeCommandActions {
  command: CommandId = "showHover";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class ShowDebugHover extends SimpleIdeCommandActions {
  command: CommandId = "showDebugHover";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class ExtractVariable extends SimpleIdeCommandActions {
  command: CommandId = "extractVariable";
  ensureSingleTarget = true;
  restoreSelection = false;
}

function callback(
  editor: EditableTextEditor,
  ranges: Range[] | undefined,
  command: CommandId,
): Promise<void> {
  // Multi target actions
  switch (command) {
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
  }

  const range = ranges?.[0];

  // Single target actions
  switch (command) {
    case "rename":
      return editor.rename(range);
    case "showReferences":
      return editor.showReferences(range);
    case "quickFix":
      return editor.quickFix(range);
    case "revealDefinition":
      return editor.revealDefinition(range);
    case "revealTypeDefinition":
      return editor.revealTypeDefinition(range);
    case "showHover":
      return editor.showHover(range);
    case "showDebugHover":
      return editor.showDebugHover(range);
    case "extractVariable":
      return editor.extractVariable(range);
  }
}
