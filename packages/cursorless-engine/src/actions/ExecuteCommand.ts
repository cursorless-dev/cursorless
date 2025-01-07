import type { ExecuteCommandOptions } from "@cursorless/common";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { ide } from "../singletons/ide.singleton";
import type { Target } from "../typings/target.types";
import { CallbackAction } from "./CallbackAction";
import type { ActionReturnValue } from "./actions.types";

/**
 * This action can be used to execute a built-in ide command on one or more
 * targets by first setting the selection to those targets and then running the
 * action, restoring the selections if
 * {@link ExecuteCommandOptions.restoreSelection restoreSelection} is `true`. Internally, most
 * of the heavy lifting is done by {@link CallbackAction}.
 */
export default class ExecuteCommand {
  private callbackAction: CallbackAction;

  constructor(rangeUpdater: RangeUpdater) {
    this.callbackAction = new CallbackAction(rangeUpdater);
    this.run = this.run.bind(this);
  }

  async run(
    targets: Target[],
    commandId: string,
    {
      commandArgs,
      ensureSingleEditor,
      ensureSingleTarget,
      restoreSelection,
      showDecorations,
    }: ExecuteCommandOptions = {},
  ): Promise<ActionReturnValue> {
    const args = commandArgs ?? [];

    return this.callbackAction.run(targets, {
      callback: () => ide().executeCommand(commandId, ...args),
      setSelection: true,
      ensureSingleEditor: ensureSingleEditor ?? false,
      ensureSingleTarget: ensureSingleTarget ?? false,
      restoreSelection: restoreSelection ?? true,
      showDecorations: showDecorations ?? true,
    });
  }
}
