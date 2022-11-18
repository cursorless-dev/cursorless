import { EditableTextEditor } from "../libs/common/types/TextEditor";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
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
 * This is just a wrapper for {@link CallbackAction} that allows the commands string without an options object.
 * Should only be used by the API. Internally go directly to {@link CallbackAction}
 */
export default class ExecuteCommand implements Action {
  private callbackAction: CallbackAction;
  constructor(graph: Graph) {
    this.callbackAction = new CallbackAction(graph);
    this.run = this.run.bind(this);
  }

  async run(
    targets: [Target[]],
    command: string,
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
      callback: (editor: EditableTextEditor) =>
        editor.executeCommand(command, ...args),
      setSelection: true,
      ensureSingleEditor: ensureSingleEditor ?? false,
      ensureSingleTarget: ensureSingleTarget ?? false,
      restoreSelection: restoreSelection ?? true,
      showDecorations: showDecorations ?? true,
    });
  }
}
