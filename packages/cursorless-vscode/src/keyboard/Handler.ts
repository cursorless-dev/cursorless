import {
  Modifier,
  PartialPrimitiveTargetDescriptor,
  PartialTargetDescriptor,
} from "@cursorless/common";
import KeyboardHandler from "./KeyboardHandler";
import Keymap from "./Keymap";
import { targetDecoratedMark } from "./Handlers/TargetHandler";
import { executeCursorlessCommand } from "./KeyboardCommandsTargeted";
import KeyboardCommandsModal from "./KeyboardVsCodeMode";
import { performActionOnTarget } from "./Handlers/ActionHandler";
import { layer0, layer1, layer2 } from "./fixedKeymap";
import { targetScope } from "./Handlers/ScopeHandler";
import { targetPairedDelimiter } from "./Handlers/PairedDelimiterHandler";
import { everyModifier, modifyInteriorExterior } from "./Handlers/ModifierHandler";

export interface KeyboardPartialTargetGenerator {
  (mode: Handler, keySequence: string): Promise<void>;
}

const commandMap: Record<string, KeyboardPartialTargetGenerator> = {
  default: targetDecoratedMark,
  blue: targetDecoratedMark,
  red: targetDecoratedMark,
  green: targetDecoratedMark,
  yellow: targetDecoratedMark,
  ex: targetDecoratedMark,
  fox: targetDecoratedMark,

  clearAndSetSelection: performActionOnTarget,
  copyToClipboard: performActionOnTarget,
  cutToClipboard: performActionOnTarget,
  deselect: performActionOnTarget,
  editNewLineAfter: performActionOnTarget,
  editNewLineBefore: performActionOnTarget,
  extractVariable: performActionOnTarget,
  findInWorkspace: performActionOnTarget,
  foldRegion: performActionOnTarget,
  followLink: performActionOnTarget,
  indentLine: performActionOnTarget,
  insertCopyAfter: performActionOnTarget,
  insertCopyBefore: performActionOnTarget,
  insertEmptyLineAfter: performActionOnTarget,
  insertEmptyLineBefore: performActionOnTarget,
  insertEmptyLinesAround: performActionOnTarget,
  outdentLine: performActionOnTarget,
  randomizeTargets: performActionOnTarget,
  remove: performActionOnTarget,
  rename: performActionOnTarget,
  revealDefinition: performActionOnTarget,
  revealTypeDefinition: performActionOnTarget,
  reverseTargets: performActionOnTarget,
  scrollToBottom: performActionOnTarget,
  scrollToCenter: performActionOnTarget,
  scrollToTop: performActionOnTarget,
  setSelection: performActionOnTarget,
  setSelectionAfter: performActionOnTarget,
  setSelectionBefore: performActionOnTarget,
  showDebugHover: performActionOnTarget,
  showHover: performActionOnTarget,
  showQuickFix: performActionOnTarget,
  showReferences: performActionOnTarget,
  sortTargets: performActionOnTarget,
  toggleLineBreakpoint: performActionOnTarget,
  toggleLineComment: performActionOnTarget,
  unfoldRegion: performActionOnTarget,
  callAsFunction: performActionOnTarget,
  editNew: performActionOnTarget,
  executeCommand: performActionOnTarget,
  generateSnippet: performActionOnTarget,
  getText: performActionOnTarget,
  highlight: performActionOnTarget,
  insertSnippet: performActionOnTarget,
  moveToTarget: performActionOnTarget,
  pasteFromClipboard: performActionOnTarget,
  replace: performActionOnTarget,
  replaceWithTarget: performActionOnTarget,
  rewrapWithPairedDelimiter: performActionOnTarget,
  swapTargets: performActionOnTarget,
  wrapWithPairedDelimiter: performActionOnTarget,
  wrapWithSnippet: performActionOnTarget,


   argumentOrParameter:targetScope,
   attribute:targetScope,
   paragraph:targetScope,
   branch:targetScope,
   functionCall:targetScope,
   functionCallee:targetScope,
   notebookCell:targetScope,
   chapter:targetScope,
   character:targetScope,
   class:targetScope,
   className:targetScope,
   comment:targetScope,
   condition:targetScope,
   xmlElement:targetScope,
   xmlEndTag:targetScope,
   environment:targetScope,
   document:targetScope,
   namedFunction:targetScope,
   functionName:targetScope,
   identifier:targetScope,
   ifStatement:targetScope,
   instance:targetScope,
   collectionItem:targetScope,
   collectionKey:targetScope,
   anonymousFunction:targetScope,
   line:targetScope,
   url:targetScope,
   list:targetScope,
   map:targetScope,
   name:targetScope,
   nonWhitespaceSequence:targetScope,
   namedParagraph:targetScope,
   part:targetScope,
   regularExpression:targetScope,
   section:targetScope,
   selector:targetScope,
   sentence:targetScope,
   boundedNonWhitespaceSequence:targetScope,
   xmlStartTag:targetScope,
   statement:targetScope,
   string:targetScope,
   subParagraph:targetScope,
   subSection:targetScope,
   subSubSection:targetScope,
   xmlBothTags:targetScope,
   token:targetScope,
   type:targetScope,
   unit:targetScope,
   value:targetScope,
   word:targetScope,
  

  squareBrackets: targetPairedDelimiter,
  curlyBrackets: targetPairedDelimiter,
  angleBrackets: targetPairedDelimiter,
  escapedSquareBrackets: targetPairedDelimiter,
  escapedDoubleQuotes: targetPairedDelimiter,
  escapedParentheses: targetPairedDelimiter,
  escapedSingleQuotes: targetPairedDelimiter,
  any: targetPairedDelimiter,
  doubleQuotes: targetPairedDelimiter,
  parentheses: targetPairedDelimiter,
  backtickQuotes: targetPairedDelimiter,
  singleQuotes: targetPairedDelimiter,
  whitespace: targetPairedDelimiter,

  interiorOnly: modifyInteriorExterior,
  excludeInterior: modifyInteriorExterior,

  everyScope: everyModifier
};

const targetCombinationOptionsList = ["replace", "list", "range"] as const;
type TargetCombinationOptions = typeof targetCombinationOptionsList[number];

export class Handler {
  private targets: PartialPrimitiveTargetDescriptor[] = [];

  public readonly keymap: Keymap;
  public readonly keyboardHandler: KeyboardHandler;

  private currentLayer = 0;
  private readonly keybindings: Record<string, string>[] = [layer0, layer1, layer2];
  private combineTargets: TargetCombinationOptions = "replace";

  constructor(
    keyboardHandler: KeyboardHandler,
    keymap: Keymap,
    private vscodeMode: KeyboardCommandsModal
  ) {
    this.keyboardHandler = keyboardHandler;
    this.keymap = keymap;
    this.handleInput = this.handleInput.bind(this);
    this.highlightTarget = this.highlightTarget.bind(this);
    this.addTarget = this.addTarget.bind(this);
    this.replaceLastTarget = this.replaceLastTarget.bind(this);
    this.setStatusBarText = this.setStatusBarText.bind(this);
    this.toggleCombineTargets = this.toggleCombineTargets.bind(this);
    this.setTargetCombinationOption = this.setTargetCombinationOption.bind(
      this
    );
    this.constructTarget = this.constructTarget.bind(this);
    this.getLatestTarget = this.getLatestTarget.bind(this);
    this.clearTargets = this.clearTargets.bind(this);
    this.getTargets = this.getTargets.bind(this);
    this.replaceAllTargets = this.replaceAllTargets.bind(this);

    this.setStatusBarText();
  }

  public async run(command: string): Promise<void> {
    await commandMap[command](this, command);
    await this.highlightTarget();
    this.currentLayer = 0;
    this.setStatusBarText();
  }

  public getFirstKeyMatching(
    key: string,
    validCommands: readonly string[]
  ): string | undefined {
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
      if (command.length > 1 && validCommands.includes(command)) {
        return command;
      }
    }
    return undefined;
  }

  public setKeybindingLayer(layer: number): void {
    this.currentLayer = layer;
    this.setStatusBarText();
  }

  async handleInput(sequence: string): Promise<void> {
    // mode variable is necessary for eval
    // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unused-vars
    const mode = this;
    const currentLayer = this.keybindings[this.currentLayer];
    if (sequence in currentLayer) {
      eval(currentLayer[sequence]);
    }
    return;
  }

  private async highlightTarget(): Promise<void> {
    await executeCursorlessCommand({
      name: "highlight",
      target: this.constructTarget(),
    });
  }

  public async modeOff(): Promise<void> {
    await this.vscodeMode.modeOff();
  }

  public replaceLastTarget(target: PartialPrimitiveTargetDescriptor): void {
    this.targets[this.targets.length - 1] = target;
  }

  public addTarget(target: PartialPrimitiveTargetDescriptor): void {
    if (this.combineTargets === "replace") {
      this.targets = [];
    }
    this.targets.push(target);
  }

  public getLatestTarget(): PartialPrimitiveTargetDescriptor {
    if (this.targets.length === 0) {
      return {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      };
    }

    return this.targets[this.targets.length - 1];
  }

  public clearTargets(): void {
    this.targets = [
      {
        type: "primitive",
        mark: {
          type: "nothing",
        },
      },
    ];
    this.highlightTarget();
    this.currentLayer = 0;
    this.targets = [];
    this.setStatusBarText();
  }

  public getTargets(): PartialPrimitiveTargetDescriptor[] {
    return this.targets;
  }

  public replaceAllTargets(targets: PartialPrimitiveTargetDescriptor[]): void {
    if (targets.length !== this.targets.length) {
      throw Error("Cannot replace targets with different number of targets");
    }
    this.targets = targets;
  }

  public constructTarget(): PartialTargetDescriptor {
    if (this.combineTargets === "list" && this.targets.length > 1) {
      const targetList = [];
      for (const target of this.targets) {
        targetList.push(target);
      }
      return {
        type: "list",
        elements: targetList,
      };
    } else if ( this.combineTargets === "range" && this.targets.length > 1) {
      return {
        type: "range",
        anchor: { type: "primitive", mark: { type: "that" } },
        active: this.targets[this.targets.length - 1],
        excludeActive: false,
        excludeAnchor: false,
      };
    }
    return this.getLatestTarget();
  }

  private setStatusBarText(): void {
    this.keyboardHandler.setStatusBarText(
      `M: ${this.combineTargets}, L: ${this.currentLayer}`
    );
  }

  public toggleCombineTargets(): void {
    const index = targetCombinationOptionsList.indexOf(this.combineTargets);
    this.setTargetCombinationOption(
      targetCombinationOptionsList[
        (index + 1) % targetCombinationOptionsList.length
      ]
    );
    this.setStatusBarText();
  }

  public setTargetCombinationOption(option: TargetCombinationOptions): void {
    this.combineTargets = option;
  }

  public addModifier(modifier: Modifier): void {
    const modifiedTargets = [];
    if (this.targets.length === 0) {
      // ensure that there is at least one target
      this.targets = [this.getLatestTarget()];
    }
    for (let curTarget of this.getTargets()) {
      if (curTarget === undefined) {
        return;
      }
      const mods:Modifier[]=[modifier]
      if ( curTarget.modifiers){
        mods.push(...curTarget.modifiers)
      }
      curTarget = {
        type: curTarget.type,
        modifiers: mods,
        mark: curTarget.mark,
      };
        modifiedTargets.push(curTarget);
    }
    this.replaceAllTargets(modifiedTargets);
  }
}
