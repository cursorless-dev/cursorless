import { PartialPrimitiveTargetDescriptor, PartialTargetDescriptor } from "@cursorless/common";
import KeyboardHandler from "./KeyboardHandler";
import Keymap from "./Keymap";
import { targetDecoratedMark } from "./Handlers/TargetHandler";
import * as vscode from "vscode";
import { executeCursorlessCommand } from "./KeyboardCommandsTargeted";
import KeyboardCommandsModal from "./KeyboardVsCodeMode";
import { performActionOnTarget } from "./Handlers/ActionHandler";
import { baseLayer, scopeLayer } from "./fixedKeymap";


export interface KeyboardPartialTargetGenerator {
    (mode: Handler, keySequence: string): Promise<void>;
}

const commandMap: Record<string, KeyboardPartialTargetGenerator> = {
    "default": targetDecoratedMark,
    "blue": targetDecoratedMark,
    "red": targetDecoratedMark,
    "green": targetDecoratedMark,
    "yellow": targetDecoratedMark,
    "ex": targetDecoratedMark,
    "fox": targetDecoratedMark,



    "clearAndSetSelection": performActionOnTarget, "copyToClipboard": performActionOnTarget, "cutToClipboard": performActionOnTarget, "deselect": performActionOnTarget, "editNewLineAfter": performActionOnTarget, "editNewLineBefore": performActionOnTarget, "extractVariable": performActionOnTarget, "findInWorkspace": performActionOnTarget, "foldRegion": performActionOnTarget, "followLink": performActionOnTarget, "indentLine": performActionOnTarget, "insertCopyAfter": performActionOnTarget, "insertCopyBefore": performActionOnTarget, "insertEmptyLineAfter": performActionOnTarget, "insertEmptyLineBefore": performActionOnTarget, "insertEmptyLinesAround": performActionOnTarget, "outdentLine": performActionOnTarget, "randomizeTargets": performActionOnTarget, "remove": performActionOnTarget, "rename": performActionOnTarget, "revealDefinition": performActionOnTarget, "revealTypeDefinition": performActionOnTarget, "reverseTargets": performActionOnTarget, "scrollToBottom": performActionOnTarget, "scrollToCenter": performActionOnTarget, "scrollToTop": performActionOnTarget, "setSelection": performActionOnTarget, "setSelectionAfter": performActionOnTarget, "setSelectionBefore": performActionOnTarget, "showDebugHover": performActionOnTarget, "showHover": performActionOnTarget, "showQuickFix": performActionOnTarget, "showReferences": performActionOnTarget, "sortTargets": performActionOnTarget, "toggleLineBreakpoint": performActionOnTarget, "toggleLineComment": performActionOnTarget, "unfoldRegion": performActionOnTarget, "callAsFunction": performActionOnTarget, "editNew": performActionOnTarget, "executeCommand": performActionOnTarget, "generateSnippet": performActionOnTarget, "getText": performActionOnTarget, "highlight": performActionOnTarget, "insertSnippet": performActionOnTarget, "moveToTarget": performActionOnTarget, "pasteFromClipboard": performActionOnTarget, "replace": performActionOnTarget, "replaceWithTarget": performActionOnTarget, "rewrapWithPairedDelimiter": performActionOnTarget, "swapTargets": performActionOnTarget, "wrapWithPairedDelimiter": performActionOnTarget, "wrapWithSnippet": performActionOnTarget,

}



export class Handler {


    private targets: PartialPrimitiveTargetDescriptor[] = [];

    public readonly keymap: Keymap;
    public readonly keyboardHandler: KeyboardHandler;

    private readonly keybindings: Record<string, string>[] = [baseLayer, scopeLayer];



    constructor(
        keyboardHandler: KeyboardHandler,
        keymap: Keymap,
        private vscodeMode: KeyboardCommandsModal,
    ) {
        this.keyboardHandler = keyboardHandler;
        this.keymap = keymap;
        this.handleInput = this.handleInput.bind(this);
        this.highlightTarget = this.highlightTarget.bind(this);
        this.addTarget = this.addTarget.bind(this);
        this.replaceLastTarget = this.replaceLastTarget.bind(this);

    }

    public async run(command: string): Promise<void> {
        await commandMap[command](this, command);
        await this.highlightTarget();
    }

    public getFirstKeyMatching(key: string,  validCommands: readonly string[]): string | undefined {
        key = key.toLowerCase();
        for (const keybinding of this.keybindings) {
            let command = keybinding[key];
            if (!command) {
                continue;
            }
            //  extract the command from the keybinding
            const commandRegex: RegExp = new RegExp(`mode.run\\("(.+?)"\\);`);
            const match = command.match(commandRegex);
            command = match ? match[1] : "";
            if (command.length >1 && validCommands.includes(command)) {
                return command;
            }
        }
        return undefined;
    }

    async handleInput(sequence: string): Promise<void> {
        const mode = this;
        if (sequence in baseLayer) {
            eval(baseLayer[sequence]);
        }
        return;
        const map = this.keymap.getMergeKeys();
        let isValidSequence = map.includes(sequence);
        // We handle multi-key sequences by repeatedly awaiting a single keypress
        // until they've pressed something in the map.
        while (!isValidSequence) {

            if (!this.keymap.isPrefixOfMapEntry(sequence)) {
                const errorMessage = `Unknown key sequence "${sequence}"`;
                vscode.window.showErrorMessage(errorMessage);
                throw Error(errorMessage);
            }

            const nextKey = await this.keyboardHandler.awaitSingleKeypress({
                cursorStyle: vscode.TextEditorCursorStyle.Underline,
                whenClauseContext: "cursorless.keyboard.targeted.awaitingKeys",
                statusBarText: "Finish sequence...",
            });

            if (nextKey == null) {
                return;
            }

            sequence += nextKey;
            isValidSequence = this.keymap.getMergeKeys().includes(sequence);
        }
        await this.getGenerator(sequence)(this, sequence);
        await this.highlightTarget();
    }

    private getGenerator(keySequence: string): KeyboardPartialTargetGenerator {
        const [section, val] = this.keymap.getSectionAndCommand(keySequence);
        switch (section) {
            case "colors":
            case "shapes":
                return targetDecoratedMark;
            case "actions":
                return performActionOnTarget;
        }
        return targetDecoratedMark;
    }
    private async highlightTarget(): Promise<void> {

        await executeCursorlessCommand({
            name: "highlight",
            target: this.constructTarget(),
        })


    }

    public async modeOff(): Promise<void> {
        await this.vscodeMode.modeOff();
    }

    public replaceLastTarget(target: PartialPrimitiveTargetDescriptor): void {
        this.targets[this.targets.length - 1] = target;
    }

    public addTarget(target: PartialPrimitiveTargetDescriptor): void {
        this.targets.push(target);
    }

    public getLatestTarget(): PartialPrimitiveTargetDescriptor {
        return this.targets[this.targets.length - 1];
    }

    public constructTarget(): PartialTargetDescriptor {
        const target: PartialTargetDescriptor = {
            type: "range",
            anchor: {
                type: "primitive",
                mark: {
                    type: "that",
                },
            },
            active: this.targets[this.targets.length - 1],
            excludeActive: false,
            excludeAnchor: false,
        };
        return this.targets[this.targets.length - 1];
    }


}