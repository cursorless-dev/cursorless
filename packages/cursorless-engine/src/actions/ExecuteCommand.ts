import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Action, ActionReturnValue } from "./actions.types";
import { CallbackAction } from "./CallbackAction";

interface Options {
  commandArgs?: any[];
  ensureSingleEditor?: boolean;
  ensureSingleTarget?: boolean;
  restoreSelection?: boolean;
  showDecorations?: boolean;
}

/**
 * This action can be used to execute a built-in ide command on one or more
 * targets by first setting the selection to those targets and then running the
 * action, restoring the selections if
 * {@link Options.restoreSelection restoreSelection} is `true`. Internally, most
 * of the heavy lifting is done by {@link CallbackAction}.
 */
export default class ExecuteCommand implements Action {
  private callbackAction: CallbackAction;
  constructor(rangeUpdater: RangeUpdater) {
    this.callbackAction = new CallbackAction(rangeUpdater);
    this.run = this.run.bind(this);
  }

  async run(
    targets: [Target[]],
    commandId: string,
    {
      commandArgs,
      ensureSingleEditor,
      ensureSingleTarget,
      restoreSelection,
      showDecorations,
    }: Options = {},
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
