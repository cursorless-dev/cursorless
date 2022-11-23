import {
  CapabilitiesCommand,
  CommandId,
  EditableTextEditor,
} from "@cursorless/common";
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
    const capabilities = ide().capabilities.getCommand(this.command);

    return this.callbackAction.run(targets, {
      callback: (editor, targets) =>
        callback(editor, targets, this.command, capabilities),
      setSelection: !capabilities.acceptsLocation,
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
  targets: Target[],
  command: CommandId,
  { acceptsLocation }: CapabilitiesCommand,
): Promise<void> {
  const ranges = acceptsLocation
    ? targets.map((t) => t.contentRange)
    : undefined;

  // Multi target actions
  switch (command) {
    case "toggleLineComment":
      return editor.toggleLineComment(ranges);
    case "indentLine":
      return editor.indentLines(ranges);
    case "outdentLine":
      return editor.outdentLines(ranges);
    case "clipboardCopy":
      return editor.clipboardCopy(ranges);
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
