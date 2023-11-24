import { ScopeType, SimpleActionName } from "@cursorless/common";
import * as vscode from "vscode";
import KeyboardCommandsTargeted from "./KeyboardCommandsTargeted";
import { ModalVscodeCommandDescriptor } from "./TokenTypes";
import { HatColor, HatShape } from "../ide/vscode/hatStyles.types";

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

  async vscodeCommand({
    command: commandInfo,
  }: {
    command: ModalVscodeCommandDescriptor;
  }) {
    const {
      commandId,
      args,
      executeAtTarget,
      keepChangedSelection,
      exitCursorlessMode,
    } =
      typeof commandInfo === "string" || commandInfo instanceof String
        ? ({ commandId: commandInfo } as Exclude<
            ModalVscodeCommandDescriptor,
            string
          >)
        : commandInfo;
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
    actionName: SimpleActionName;
  }) {
    this.targeted.performActionOnTarget(actionName);
  }

  targetScopeType(arg: { scopeType: ScopeType }) {
    this.targeted.targetScopeType(arg);
  }

  targetRelativeScope({ offset, length, scopeType }: TargetRelativeScopeArg) {
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
interface TargetRelativeScopeArg {
  offset: Offset;
  length: number | null;
  scopeType: ScopeType;
}

interface Offset {
  direction?: "forward" | "backward" | null;
  number?: number | null;
}
