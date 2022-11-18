import {
  CommandId,
  EditableTextEditor,
  Range,
  sleep,
} from "@cursorless/common";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { ActionReturnValue } from "./actions.types";
import CallbackAction from "./CallbackAction";
import CommandAction from "./CommandAction";

abstract class MakeshiftAction extends CommandAction {
  abstract command: string;
  restoreSelection?: boolean;
  commandArg?: object;
  ensureSingleTarget?: boolean;
  postCommandSleepMs?: number;

  async run(targets: [Target[]]) {
    const returnValue = await super.run(targets, {
      command: this.command,
      commandArgs: this.commandArg ? [this.commandArg] : [],
      ensureSingleTarget: this.ensureSingleTarget ?? false,
      restoreSelection: this.restoreSelection ?? true,
    });
    if (this.postCommandSleepMs) {
      await sleep(this.postCommandSleepMs);
    }
    return returnValue;
  }
}

export class RevealDefinition extends MakeshiftAction {
  command = "editor.action.revealDefinition";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class RevealTypeDefinition extends MakeshiftAction {
  command = "editor.action.goToTypeDefinition";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class ShowHover extends MakeshiftAction {
  command = "editor.action.showHover";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class ShowDebugHover extends MakeshiftAction {
  command = "editor.debug.action.showDebugHover";
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class ShowQuickFix extends MakeshiftAction {
  command = "editor.action.quickFix";
  ensureSingleTarget = true;
  postCommandSleepMs = 100;
}

export class ShowReferences extends MakeshiftAction {
  command = "references-view.find";
  ensureSingleTarget = true;
}

export class Rename extends MakeshiftAction {
  command = "editor.action.rename";
  ensureSingleTarget = true;
}

export class ExtractVariable extends MakeshiftAction {
  command = "editor.action.codeAction";
  commandArg = {
    kind: "refactor.extract.constant",
    preferred: true,
  };
  ensureSingleTarget = true;
  restoreSelection = false;
}

export class IndentLines extends MakeshiftAction {
  command = "editor.action.indentLines";
}

export class OutdentLines extends MakeshiftAction {
  command = "editor.action.outdentLines";
}

abstract class MakeshiftAction2 extends CallbackAction {
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
    const capabilities = ide().capabilities.commands[this.command];

    if (capabilities == null) {
      throw Error(`Missing command capabilities for '${this.command}'`);
    }

    return super.run(targets, {
      callback: this.callback,
      setSelection: !capabilities.acceptsLocation,
      ensureSingleEditor: this.ensureSingleEditor,
      ensureSingleTarget: this.ensureSingleTarget,
      restoreSelection: this.restoreSelection,
      showDecorations: this.showDecorations,
    });
  }

  private async callback(
    editor: EditableTextEditor,
    ranges: Range[],
  ): Promise<void> {
    switch (this.command) {
      case "toggleLineComment":
        return editor.toggleLineComment(ranges);
      default:
        throw Error(`Unknown command '${this.command}'`);
    }
  }
}

export class CommentLines extends MakeshiftAction2 {
  command: CommandId = "toggleLineComment";
  ensureSingleEditor = true;
}
