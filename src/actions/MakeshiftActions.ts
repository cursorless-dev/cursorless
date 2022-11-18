import { CommandId, EditableTextEditor } from "@cursorless/common";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { ActionReturnValue } from "./actions.types";
import CallbackAction from "./CallbackAction";

abstract class MakeshiftAction extends CallbackAction {
  abstract command: CommandId;
  ensureSingleEditor: boolean = false;
  ensureSingleTarget: boolean = false;
  restoreSelection: boolean = true;
  showDecorations: boolean = true;

  constructor(graph: Graph) {
    super(graph);
    this.run = this.run.bind(this);
    this.callback = this.callback.bind(this);
  }

  async run(targets: [Target[]]): Promise<ActionReturnValue> {
    const capabilities = ide().capabilities.getCommand(this.command);

    return super.run(targets, {
      callback: this.callback,
      setSelection: !capabilities.acceptsLocation,
      ensureSingleEditor: this.ensureSingleEditor,
      ensureSingleTarget: this.ensureSingleTarget,
      restoreSelection: this.restoreSelection,
      showDecorations: this.showDecorations,
    });
  }

  private callback(
    editor: EditableTextEditor,
    targets: Target[],
  ): Promise<void> {
    const ranges = targets.map((t) => t.contentRange);

    // Multi target actions
    switch (this.command) {
      case "toggleLineComment":
        return editor.toggleLineComment(ranges);
      case "indentLine":
        return editor.indentLines(ranges);
      case "outdentLine":
        return editor.outdentLines(ranges);
    }

    const range = ranges[0];

    // Single target actions
    switch (this.command) {
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

    throw Error(`Unknown command '${this.command}'`);
  }
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
