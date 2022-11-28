import { CommandId, EditableTextEditor } from "@cursorless/common";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { ActionReturnValue } from "./actions.types";
import { CallbackAction } from "./CallbackAction";

interface Options {
  showDecorations?: boolean;
}

abstract class MakeshiftAction {
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

export class CopyToClipboard extends MakeshiftAction {
  command: CommandId = "clipboardCopy";
  ensureSingleEditor = true;
}

export class ToggleLineComment extends MakeshiftAction {
  command: CommandId = "toggleLineComment";
}

export class IndentLine extends MakeshiftAction {
  command: CommandId = "indentLine";
}

export class OutdentLine extends MakeshiftAction {
  command: CommandId = "outdentLine";
}

export class Fold extends MakeshiftAction {
  command: CommandId = "fold";
}

export class Unfold extends MakeshiftAction {
  command: CommandId = "unfold";
}

export class Rename extends MakeshiftAction {
  command: CommandId = "rename";
  ensureSingleTarget = true;
}

export class ShowReferences extends MakeshiftAction {
  command: CommandId = "showReferences";
  ensureSingleTarget = true;
}

export class ShowQuickFix extends MakeshiftAction {
  command: CommandId = "quickFix";
  ensureSingleTarget = true;
}

export class RevealDefinition extends MakeshiftAction {
  command: CommandId = "revealDefinition";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class RevealTypeDefinition extends MakeshiftAction {
  command: CommandId = "revealTypeDefinition";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class ShowHover extends MakeshiftAction {
  command: CommandId = "showHover";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class ShowDebugHover extends MakeshiftAction {
  command: CommandId = "showDebugHover";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class ExtractVariable extends MakeshiftAction {
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
