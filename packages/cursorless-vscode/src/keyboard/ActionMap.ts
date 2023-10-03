import { ActionType } from "@cursorless/common";
import KeyboardCommandsTargeted, { executeCursorlessCommand } from "./KeyboardCommandsTargeted";
import * as vscode from "vscode";


export default class ActionMap {
    actionMap: Record<string, ActionType>;


    constructor(actionMap: Record<string, ActionType>) {
        this.actionMap = actionMap;
    }

    getAction(key: string): ActionType | undefined {
        return this.actionMap[key];
    }

    isAction(key: string): boolean {
        return this.actionMap[key] !== undefined;
    }

    async handleInput(key: string, state: KeyboardCommandsTargeted) {
        let returnValue: unknown;
        if (!this.isAction(key)) {
            return;
        }
        const name: ActionType = this.getAction(key)!;
        const target = state.lastTarget;

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

                if ( target.type !== "primitive" ) {
                    throw Error(`Unsupported target type: ${target.type} for action: ${name}`);
                }

                returnValue = await executeCursorlessCommand({
                    name,
                    destination: {
                        type: "primitive",
                        insertionMode: "to",
                        target,
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

        await state.highlightTarget();

        const EXIT_CURSORLESS_MODE_ACTIONS: string[] = vscode.workspace.getConfiguration("cursorless.experimental.keyboard.modal").get("exit_actions") ?? [];

        if (EXIT_CURSORLESS_MODE_ACTIONS.includes(name)) {
            // For some Cursorless actions, it is more convenient if we automatically
            // exit modal mode
            await state.getMode().modeOff();
        }

        return returnValue;
    }


}