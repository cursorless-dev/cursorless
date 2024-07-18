import { Modifier, PartialMark, SurroundingPairName } from "@cursorless/common";
import { surroundingPairsDelimiters } from "@cursorless/cursorless-engine";
import { isString } from "lodash-es";
import * as vscode from "vscode";
import { HatColor, HatShape } from "../ide/vscode/hatStyles.types";
import {
  SimpleKeyboardActionDescriptor,
  SpecificKeyboardActionDescriptor,
} from "./KeyboardActionType";
import KeyboardCommandsTargeted, {
  TargetingMode,
} from "./KeyboardCommandsTargeted";
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
    actionDescriptor: SimpleKeyboardActionDescriptor;
  }) {
    this.targeted.performSimpleActionOnTarget(actionDescriptor);
  }

  performWrapActionOnTarget({ actionDescriptor, delimiter }: WrapActionArg) {
    const [left, right] = surroundingPairsDelimiters[delimiter]!;
    this.targeted.performActionOnTarget(
      (target) => ({
        name: "wrapWithPairedDelimiter",
        target,
        left,
        right,
      }),
      actionDescriptor,
    );
  }

  modifyTarget({
    modifier,
    mode,
  }: {
    modifier: Modifier;
    mode?: TargetingMode;
  }) {
    this.targeted.targetModifier(modifier, mode);
  }

  targetMark({ mark, mode }: { mark: PartialMark; mode?: TargetingMode }) {
    this.targeted.targetMark(mark, mode);
  }
}

interface DecoratedMarkArg {
  decoratedMark: {
    color?: HatColor;
    shape?: HatShape;
  };
  mode: TargetingMode;
}

interface WrapActionArg {
  actionDescriptor: SpecificKeyboardActionDescriptor<"wrap">;
  delimiter: SurroundingPairName;
}
