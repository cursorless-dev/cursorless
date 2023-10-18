import { PartialPrimitiveTargetDescriptor, PartialTargetDescriptor } from "@cursorless/common";
import KeyboardHandler from "./KeyboardHandler";
import Keymap from "./Keymap";
import { targetDecoratedMark } from "./Handlers/TargetHandler";
import * as vscode from "vscode";
import { executeCursorlessCommand } from "./KeyboardCommandsTargeted";
import KeyboardCommandsModal from "./KeyboardVsCodeMode";
import { performActionOnTarget } from "./Handlers/ActionHandler";


export interface KeyboardPartialTargetGenerator {
    (mode: Handler, keySequence: string): Promise<void>;
}




export class Handler{


    private targets: PartialPrimitiveTargetDescriptor[] = [];

    public readonly keymap: Keymap;
    public readonly keyboardHandler: KeyboardHandler;


    

    constructor(
        keyboardHandler: KeyboardHandler,
        keymap: Keymap,
        private vscodeMode: KeyboardCommandsModal,
    ){
        this.keyboardHandler = keyboardHandler;
        this.keymap = keymap;
        this.handleInput = this.handleInput.bind(this);
        this.highlightTarget = this.highlightTarget.bind(this);
        this.addTarget = this.addTarget.bind(this);
        this.replaceLastTarget = this.replaceLastTarget.bind(this);

    } 


    async handleInput(sequence: string): Promise<void> {

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
        await this.getGenerator(sequence)(this,sequence);       
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

    public async modeOff(): Promise<void>{
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
        const target: PartialTargetDescriptor= {
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
        return target;
    }


}