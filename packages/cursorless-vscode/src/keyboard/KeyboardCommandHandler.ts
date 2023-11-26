import { ScopeType } from "@cursorless/common";
import * as vscode from "vscode";
import { HatColor, HatShape } from "../ide/vscode/hatStyles.types";
import { SimpleKeyboardActionType } from "./KeyboardActionType";
import KeyboardCommandsTargeted from "./KeyboardCommandsTargeted";
import { ModalVscodeCommandDescriptor } from "./TokenTypes";

/**
 * This class defines the keyboard commands available to our modal keyboard
 * mode.
 *
 * Each method in this class corresponds to a top-level rule in the grammar. The
 * method name is the name of the rule, and the method's argument is the rule's
 * `arg` output.
 *
 * We try to keep all logic out of the grammar and use this class instead
 * because:
 *
 * 1. The grammar has no type information, autocomplete, or autoformatting
 * 2. If the grammar is defined by just a list of keys, as it is today, we can
 *    actually detect partial arguments as they're being constructed and display
 *    them to the user
 *
 * Thus, we use this class as a simple layer where we have strong types and can
 * do some simple logic.
 */
export class KeyboardCommandHandler {
  constructor(private targeted: KeyboardCommandsTargeted) {}

  targetDecoratedMarkReplace({ decoratedMark }: DecoratedMarkArg) {
    this.targeted.targetDecoratedMark(decoratedMark);
  }

  targetDecoratedMarkExtend({ decoratedMark }: DecoratedMarkArg) {
    this.targeted.targetDecoratedMark({
      ...decoratedMark,
      mode: "extend",
    });
  }

  targetDecoratedMarkAppend({ decoratedMark }: DecoratedMarkArg) {
    this.targeted.targetDecoratedMark({
      ...decoratedMark,
      mode: "append",
    });
  }

  async vscodeCommand({
    command: commandInfo,
  }: {
    command: ModalVscodeCommandDescriptor;
  }) {
    // plain ol' string command id
    if (isString(commandInfo)) {
      await vscode.commands.executeCommand(commandInfo);
      return;
    }

    // structured command
    const {
      commandId,
      args,
      executeAtTarget,
      keepChangedSelection,
      exitCursorlessMode,
    } = commandInfo;

    if (executeAtTarget) {
      await this.targeted.performVscodeCommandOnTarget(commandId, {
        args,
        keepChangedSelection,
        exitCursorlessMode,
      });
      return;
    }

    await vscode.commands.executeCommand(commandId, ...(args ?? []));
  }

  performSimpleActionOnTarget({
    actionName,
  }: {
    actionName: SimpleKeyboardActionType;
  }) {
    this.targeted.performActionOnTarget(actionName);
  }

  modifyTargetContainingScope(arg: { scopeType: ScopeType }) {
    this.targeted.modifyTargetContainingScope(arg);
  }

  targetEveryScopeType(arg: { scopeType: ScopeType }) {
    this.targeted.modifyTargetContainingScope({ ...arg, type: "everyScope" });
  }

  targetRelativeExclusiveScope({
    offset,
    length,
    scopeType,
  }: TargetRelativeExclusiveScopeArg) {
    this.targeted.targetModifier({
      type: "relativeScope",
      offset: offset?.number ?? 1,
      direction: offset?.direction ?? "forward",
      length: length ?? 1,
      scopeType,
    });
  }
}

interface DecoratedMarkArg {
  decoratedMark: {
    color?: HatColor;
    shape?: HatShape;
  };
}
interface TargetRelativeExclusiveScopeArg {
  offset: Offset;
  length: number | null;
  scopeType: ScopeType;
}

interface Offset {
  direction: "forward" | "backward" | null;
  number: number | null;
}

function isString(input: any): input is string {
  return typeof input === "string" || input instanceof String;
}
