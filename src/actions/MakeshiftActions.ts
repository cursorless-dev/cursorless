import sleep from "../libs/common/util/sleep";
import { Target } from "../typings/target.types";
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

export class CommentLines extends MakeshiftAction {
  command = "editor.action.commentLine";
}
