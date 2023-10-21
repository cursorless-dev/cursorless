import * as vscode from "vscode";



import { executeCursorlessCommand } from "../KeyboardCommandsTargeted";
import { Handler } from "../Handler";
import { ActionType } from "@cursorless/common";




/**
   * Performs action {@link name} on the current target
   * @param name The action to run
   * @returns A promise that resolves to the result of the cursorless command
   */
export async function performActionOnTarget(mode: Handler, keySequence: string): Promise<void> {

    const name = keySequence as ActionType;

    const target= mode.constructTarget();
    const lastPrimTarget = mode.getLatestTarget();

    let returnValue: unknown;

    switch (name) {
        case "wrapWithPairedDelimiter":
        case "rewrapWithPairedDelimiter":
        case "insertSnippet":
        case "wrapWithSnippet":
        case "executeCommand":
        case "replace":
        case "editNew":
        case "getText":
            throw Error(`Unsupported keyboard action: ${name}`);
        case "replaceWithTarget":
        case "moveToTarget":
            returnValue = await executeCursorlessCommand({
                name,
                source: target,
                destination: { type: "implicit" },
            });
            break;
        case "swapTargets":
            returnValue = await executeCursorlessCommand({
                name,
                target1: target,
                target2: { type: "implicit" },
            });
            break;
        case "callAsFunction":
            returnValue = await executeCursorlessCommand({
                name,
                callee: target,
                argument: { type: "implicit" },
            });
            break;
        case "pasteFromClipboard":
            returnValue = await executeCursorlessCommand({
                name,
                destination: {
                    type: "primitive",
                    insertionMode: "to",
                    target: lastPrimTarget,
                },
            });
            break;
        case "generateSnippet":
        case "highlight":
            returnValue = await executeCursorlessCommand({
                name,
                target,
            });
            break;
        default:
            returnValue = await executeCursorlessCommand({
                name,
                target,
            });
    }

    const EXIT_CURSORLESS_MODE_ACTIONS: string[] = vscode.workspace.getConfiguration("cursorless.experimental.keyboard.modal").get("exit_actions") ?? [];

    if (EXIT_CURSORLESS_MODE_ACTIONS.includes(name)) {
        // For some Cursorless actions, it is more convenient if we automatically
        // exit modal mode
        await mode.modeOff();
    }
    mode.clearTargets();
    
}
