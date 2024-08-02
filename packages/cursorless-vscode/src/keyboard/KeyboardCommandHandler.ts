import type {
  Modifier,
  PartialMark,
  SurroundingPairName,
} from "@cursorless/common";
import { surroundingPairsDelimiters } from "@cursorless/cursorless-engine";
import { isString } from "lodash-es";
import * as vscode from "vscode";
import type { HatColor, HatShape } from "../ide/vscode/hatStyles.types";
import type {
  SimpleKeyboardActionDescriptor,
  SpecificKeyboardActionDescriptor,
} from "./KeyboardActionType";
import type { TargetingMode } from "./KeyboardCommandsTargeted";
import type KeyboardCommandsTargeted from "./KeyboardCommandsTargeted";
import type { ModalVscodeCommandDescriptor } from "./TokenTypes";

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

  async targetDecoratedMark({ decoratedMark, mode }: DecoratedMarkArg) {
    await this.targeted.targetDecoratedMark({ ...decoratedMark, mode });
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

  async performSimpleActionOnTarget({
    actionDescriptor,
  }: {
    actionDescriptor: SimpleKeyboardActionDescriptor;
  }) {
    await this.targeted.performSimpleActionOnTarget(actionDescriptor);
  }

  async performWrapActionOnTarget({
    actionDescriptor,
    delimiter,
  }: WrapActionArg) {
    const [left, right] = surroundingPairsDelimiters[delimiter]!;
    await this.targeted.performActionOnTarget(
      (target) => ({
        name: "wrapWithPairedDelimiter",
        target,
        left,
        right,
      }),
      actionDescriptor,
    );
  }

  async modifyTarget({
    modifier,
    mode,
  }: {
    modifier: Modifier;
    mode?: TargetingMode;
  }) {
    await this.targeted.targetModifier(modifier, mode);
  }

  async targetMark({
    mark,
    mode,
  }: {
    mark: PartialMark;
    mode?: TargetingMode;
  }) {
    await this.targeted.targetMark(mark, mode);
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
