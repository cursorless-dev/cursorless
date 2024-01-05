import { Modifier, SurroundingPairName } from "@cursorless/common";
import * as vscode from "vscode";
import { HatColor, HatShape } from "../ide/vscode/hatStyles.types";
import {
  KeyboardActionDescriptor,
  SimpleKeyboardActionType,
} from "./KeyboardActionType";
import KeyboardCommandsTargeted from "./KeyboardCommandsTargeted";
import { ModalVscodeCommandDescriptor } from "./TokenTypes";
import { surroundingPairsDelimiters } from "@cursorless/cursorless-engine";

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

  targetDecoratedMark({ decoratedMark, mode }: DecoratedMarkArg) {
    this.targeted.targetDecoratedMark({ ...decoratedMark, mode });
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
    actionDescriptor,
  }: {
    actionDescriptor: KeyboardActionDescriptor;
  }) {
    this.targeted.performSimpleActionOnTarget(actionDescriptor);
  }

  performWrapActionOnTarget({ delimiter }: { delimiter: SurroundingPairName }) {
    const [left, right] = surroundingPairsDelimiters[delimiter]!;
    this.targeted.performActionOnTarget((target) => ({
      action: {
        name: "wrapWithPairedDelimiter",
        target,
        left,
        right,
      },
      exitCursorlessMode: false,
    }));
  }

  modifyTarget({ modifier }: { modifier: Modifier }) {
    this.targeted.targetModifier(modifier);
  }
}

interface DecoratedMarkArg {
  decoratedMark: {
    color?: HatColor;
    shape?: HatShape;
  };
  mode: "replace" | "extend" | "append";
}

export function isString(input: any): input is string {
  return typeof input === "string" || input instanceof String;
}
