import { commands, TextEditor } from "vscode";
import { callFunctionAndUpdateRanges } from "../../core/updateSelections/updateSelections";
import { Graph } from "../../typings/Types";
import { CommandTarget, State } from "./EditNew.types";

/**
 * Handle targets that will use a VSCode command to insert a new target, eg
 * `editor.action.insertLineAfter`, and return an updated state object.
 *
 * We proceed by moving cursor to given targets, and then performing the
 * command.
 * @param graph The graph object
 * @param editor The editor on which we're operating
 * @param state The state object tracking cursors, thatMark, etc
 * @returns An updated `state` object
 */
export async function runCommandTargets(
  graph: Graph,
  editor: TextEditor,
  state: State
): Promise<State> {
  const commandTargets: CommandTarget[] = state.targets
    .map((target, index) => {
      const context = target.getEditNewContext();
      if (context.type === "command") {
        return {
          target,
          index,
          command: context.command,
        };
      }
    })
    .filter((target): target is CommandTarget => !!target);

  if (commandTargets.length === 0) {
    return state;
  }

  const command = ensureSingleCommand(commandTargets);

  await graph.actions.setSelection.run([
    commandTargets.map(({ target }) => target),
  ]);

  const [updatedTargetRanges, updatedThatRanges] =
    await callFunctionAndUpdateRanges(
      graph.rangeUpdater,
      () => commands.executeCommand(command),
      editor.document,
      [state.targets.map(({ contentRange }) => contentRange), state.thatRanges]
    );

  // For each of the given command targets, the cursor will go where it ended
  // up after running the command.  We add it to the state so that any
  // potential edit targets can update them after we return from this function.
  const cursorRanges = [...state.cursorRanges];
  commandTargets.forEach((commandTarget, index) => {
    cursorRanges[commandTarget.index] = editor.selections[index];
  });

  return {
    targets: state.targets.map((target, index) =>
      target.withContentRange(updatedTargetRanges[index])
    ),
    thatRanges: updatedThatRanges,
    cursorRanges,
  };
}

function ensureSingleCommand(targets: CommandTarget[]) {
  const commands = targets.map((target) => target.command);
  if (new Set(commands).size > 1) {
    throw new Error("Can't run different commands at once");
  }
  return commands[0];
}
