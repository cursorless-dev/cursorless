import type { ActionType } from "../types/command/ActionDescriptor";
import { connectiveSpokenForms } from "./connectiveSpokenForms";
import { getSpokenForm } from "./getSpokenForm";
import type { ReferenceEntry } from "./ReferenceEntry";
import { scopeReferences } from "./scopeReferences";
import {
  VAR_DESTINATION,
  VAR_FORMATTER,
  VAR_PAIR,
  VAR_SCOPE,
  VAR_SNIPPET,
  VAR_SPOKEN_FORM,
  VAR_TARGET,
  VAR_TARGET_1,
  VAR_TARGET_2,
} from "./variables";

const TARGET = "blue air";
const TARGET_DESC = "token containing letter 'a' with a blue hat";
// const TARGET_2 = "green bat";
// const TARGET_2_DESC = "token containing letter 'b' with a green hat";

const DEFAULT_PATTERN = `${VAR_SPOKEN_FORM} ${VAR_TARGET}`;
const DEFAULT_PATTERN_SCOPE = `${VAR_SPOKEN_FORM} ${VAR_SCOPE} ${VAR_TARGET}`;
const DEFAULT_COMMAND = `${VAR_SPOKEN_FORM} ${TARGET}`;

// const COLLECTION_ITEM_SCOPE = getSpokenForm(scopeReferences.collectionItem);
// const FUNCTION_CALL_SCOPE = getSpokenForm(scopeReferences.functionCall);
// const INSTANCE_SCOPE = getSpokenForm(scopeReferences.instance);
// const NAMED_FUNCTION_SCOPE = getSpokenForm(scopeReferences.namedFunction);
const TOKEN_SCOPE = getSpokenForm(scopeReferences.token);
// const EVERY_MODIFIER = getSpokenForm(modifierReferences.everyScope);
const SET_SELECTION_SPOKEN_FORM = "take";

const SWAP_CONNECTIVE = connectiveSpokenForms.swapConnective;

type TalonSideActionType = "applyFormatter" | "nextHomophone";

export const actionReferences: Record<
  ActionType | TalonSideActionType,
  ReferenceEntry
> = {
  addSelection: {
    name: "Add selection",
    defaultSpokenForm: "append",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Adds ${VAR_TARGET} to the current selection set.`,
        cheatsheet: "Add selection",
      },
    ],
    examples: [],
  },
  addSelectionAfter: {
    name: "Add selection after",
    defaultSpokenForm: "append post",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Adds empty selection after ${VAR_TARGET} to the current selection set.`,
        cheatsheet: "Add selection after",
      },
    ],
    examples: [],
  },
  addSelectionBefore: {
    name: "Add selection before",
    defaultSpokenForm: "append pre",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Adds empty selection before ${VAR_TARGET} to the current selection set.`,
        cheatsheet: "Add selection before",
      },
    ],
    examples: [],
  },
  breakLine: {
    name: "Break line",
    defaultSpokenForm: "break",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Breaks the line before ${VAR_TARGET}.`,
        cheatsheet: "Breaks the line",
      },
    ],
    examples: [],
  },
  clearAndSetSelection: {
    name: "Change",
    defaultSpokenForm: "change",
    legacySpokenForms: ["clear"],
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Change ${VAR_TARGET} by clearing it and leaving the cursor in its place.`,
        cheatsheet: "Change",
      },
    ],
    examples: [],
  },
  copyToClipboard: {
    name: "Copy to clipboard",
    defaultSpokenForm: "copy",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Copy ${VAR_TARGET} to clipboard.`,
        cheatsheet: "Copy to clipboard",
      },
    ],
    examples: [],
  },
  cutToClipboard: {
    name: "Cut to clipboard",
    defaultSpokenForm: "carve",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Cut ${VAR_TARGET} to clipboard.`,
        cheatsheet: "Cut to clipboard",
      },
    ],
    examples: [],
  },
  decrement: {
    name: "Decrement",
    defaultSpokenForm: "decrement",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Decrement number at ${VAR_TARGET}.`,
        cheatsheet: "Decrement number",
      },
    ],
    examples: [],
  },
  deselect: {
    name: "Deselect",
    defaultSpokenForm: "give",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Deselect ${VAR_TARGET}.`,
        cheatsheet: "Deselect",
      },
    ],
    examples: [],
  },
  editNewLineAfter: {
    name: "Edit new line/scope after",
    defaultSpokenForm: "pour",
    description: "Scope defaults to line.",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Edit new line after ${VAR_TARGET}.`,
        cheatsheet: "Edit new line after",
      },
      {
        pattern: DEFAULT_PATTERN_SCOPE,
        description: `Edit new ${VAR_SCOPE} after ${VAR_TARGET}.`,
        cheatsheet: `Edit new ${VAR_SCOPE} after`,
      },
    ],
    examples: [],
  },
  editNewLineBefore: {
    name: "Edit new line/scope before",
    defaultSpokenForm: "drink",
    description: "Scope defaults to line.",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Edit new line before ${VAR_TARGET}.`,
        cheatsheet: "Edit new line before",
      },
      {
        pattern: DEFAULT_PATTERN_SCOPE,
        description: `Edit new ${VAR_SCOPE} before ${VAR_TARGET}.`,
        cheatsheet: `Edit new ${VAR_SCOPE} before`,
      },
    ],
    examples: [],
  },
  "experimental.setInstanceReference": {
    name: "Set instance reference",
    defaultSpokenForm: "from",
    description:
      "Sets the instance reference for the next 'instance of' action.",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Set instance reference to ${VAR_TARGET}.`,
        cheatsheet: "Set instance reference",
      },
    ],
    examples: [],
  },
  extractVariable: {
    name: "Extract variable",
    defaultSpokenForm: "extract",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Extract variable from ${VAR_TARGET}.`,
        cheatsheet: "Extract variable",
      },
    ],
    examples: [],
  },
  findInDocument: {
    name: "Find in document",
    defaultSpokenForm: "scout",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Find ${VAR_TARGET} in document.`,
        cheatsheet: "Find in document",
      },
    ],
    examples: [],
  },
  findInWorkspace: {
    name: "Find in workspace",
    defaultSpokenForm: "scout all",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Find ${VAR_TARGET} in workspace.`,
        cheatsheet: "Find in workspace",
      },
    ],
    examples: [],
  },
  flashTargets: {
    name: "Flash target",
    defaultSpokenForm: "flash",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Flash ${VAR_TARGET}.`,
        cheatsheet: "Flash target",
      },
    ],
    examples: [],
  },
  foldRegion: {
    name: "Fold region",
    defaultSpokenForm: "fold",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Fold region at ${VAR_TARGET}.`,
        cheatsheet: "Fold region",
      },
    ],
    examples: [],
  },
  followLink: {
    name: "Follow link",
    defaultSpokenForm: "follow",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Follow link at ${VAR_TARGET}.`,
        cheatsheet: "Follow link",
      },
    ],
    examples: [],
  },
  followLinkAside: {
    name: "Follow link aside",
    defaultSpokenForm: "follow split",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Follow link at ${VAR_TARGET} aside (e.g. in a split view).`,
        cheatsheet: "Follow link aside",
      },
    ],
    examples: [],
  },
  gitAccept: {
    name: "Git accept",
    defaultSpokenForm: "git accept",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Accept Git change at ${VAR_TARGET}.`,
        cheatsheet: "Git accept",
      },
    ],
    examples: [],
  },
  gitRevert: {
    name: "Git revert",
    defaultSpokenForm: "git revert",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Revert Git change at ${VAR_TARGET}.`,
        cheatsheet: "Git revert",
      },
    ],
    examples: [],
  },
  gitStage: {
    name: "Git stage",
    defaultSpokenForm: "git stage",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Stage Git change at ${VAR_TARGET}.`,
        cheatsheet: "Git stage",
      },
    ],
    examples: [],
  },
  gitUnstage: {
    name: "Git unstage",
    defaultSpokenForm: "git unstage",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Unstage Git change at ${VAR_TARGET}.`,
        cheatsheet: "Git unstage",
      },
    ],
    examples: [],
  },
  increment: {
    name: "Increment",
    defaultSpokenForm: "increment",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Increment number at ${VAR_TARGET}.`,
        cheatsheet: "Increment number",
      },
    ],
    examples: [],
  },
  indentLine: {
    name: "Indent line",
    defaultSpokenForm: "indent",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Indent line containing ${VAR_TARGET}.`,
        cheatsheet: "Indent line",
      },
    ],
    examples: [],
  },
  insertCopyAfter: {
    name: "Insert copy after",
    defaultSpokenForm: "clone",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Insert copy after ${VAR_TARGET}.`,
        cheatsheet: "Insert copy after",
      },
    ],
    examples: [],
  },
  insertCopyBefore: {
    name: "Insert copy before",
    defaultSpokenForm: "clone up",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Insert copy before ${VAR_TARGET}.`,
        cheatsheet: "Insert copy before",
      },
    ],
    examples: [],
  },
  insertEmptyLineAfter: {
    name: "Insert empty line after",
    defaultSpokenForm: "float",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Insert empty line after ${VAR_TARGET}.`,
        cheatsheet: "Insert empty line after",
      },
    ],
    examples: [],
  },
  insertEmptyLineBefore: {
    name: "Insert empty line before",
    defaultSpokenForm: "drop",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Insert empty line before ${VAR_TARGET}.`,
        cheatsheet: "Insert empty line before",
      },
    ],
    examples: [],
  },
  insertEmptyLinesAround: {
    name: "Insert empty lines around",
    defaultSpokenForm: "puff",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Insert empty lines around ${VAR_TARGET}.`,
        cheatsheet: "Insert empty lines around",
      },
    ],
    examples: [],
  },
  joinLines: {
    name: "Join lines",
    defaultSpokenForm: "join",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Join lines at ${VAR_TARGET}.`,
        cheatsheet: "Join lines",
      },
    ],
    examples: [],
  },
  outdentLine: {
    name: "Outdent line",
    defaultSpokenForm: "dedent",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Outdent line containing ${VAR_TARGET}.`,
        cheatsheet: "Outdent line",
      },
    ],
    examples: [],
  },
  randomizeTargets: {
    name: "Randomize targets",
    defaultSpokenForm: "shuffle",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Randomize ${VAR_TARGET}s.`,
        cheatsheet: "Randomize targets",
      },
    ],
    examples: [],
  },
  remove: {
    name: "Remove",
    defaultSpokenForm: "chuck",
    description:
      "This action can be used to remove a target without moving the cursor.",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Remove ${VAR_TARGET}.`,
        cheatsheet: "Remove",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Removes the ${TARGET_DESC}.`,
      },
    ],
  },
  rename: {
    name: "Rename",
    defaultSpokenForm: "rename",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Rename ${VAR_TARGET}.`,
        cheatsheet: "Rename",
      },
    ],
    examples: [],
  },
  revealDefinition: {
    name: "Reveal definition",
    defaultSpokenForm: "define",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Reveal definition of ${VAR_TARGET}.`,
        cheatsheet: "Reveal definition",
      },
    ],
    examples: [],
  },
  revealTypeDefinition: {
    name: "Reveal type definition",
    defaultSpokenForm: "type deaf",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Reveal type definition of ${VAR_TARGET}.`,
        cheatsheet: "Reveal type definition",
      },
    ],
    examples: [],
  },
  reverseTargets: {
    name: "Reverse targets",
    defaultSpokenForm: "reverse",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Reverse ${VAR_TARGET}s.`,
        cheatsheet: "Reverse targets",
      },
    ],
    examples: [],
  },
  scrollToBottom: {
    name: "Scroll to bottom",
    defaultSpokenForm: "bottom",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Scroll ${VAR_TARGET} to bottom of the viewport.`,
        cheatsheet: "Scroll to bottom",
      },
    ],
    examples: [],
  },
  scrollToCenter: {
    name: "Scroll to center",
    defaultSpokenForm: "center",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Scroll ${VAR_TARGET} to center of the viewport.`,
        cheatsheet: "Scroll to center",
      },
    ],
    examples: [],
  },
  scrollToTop: {
    name: "Scroll to top",
    defaultSpokenForm: "crown",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Scroll ${VAR_TARGET} to top of the viewport.`,
        cheatsheet: "Scroll to top",
      },
    ],
    examples: [],
  },
  setSelection: {
    name: "Set selection",
    defaultSpokenForm: SET_SELECTION_SPOKEN_FORM,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Set selection to ${VAR_TARGET}.`,
        cheatsheet: "Set selection",
      },
    ],
    examples: [],
  },
  setSelectionAfter: {
    name: "Set selection after",
    defaultSpokenForm: "post",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Set empty selection after ${VAR_TARGET}.`,
        cheatsheet: "Set selection after",
      },
    ],
    examples: [],
  },
  setSelectionBefore: {
    name: "Set selection before",
    defaultSpokenForm: "pre",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Set empty selection before ${VAR_TARGET}.`,
        cheatsheet: "Set selection before",
      },
    ],
    examples: [],
  },
  showDebugHover: {
    name: "Show debug hover",
    defaultSpokenForm: "inspect",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Show debug hover for ${VAR_TARGET}.`,
        cheatsheet: "Show debug hover",
      },
    ],
    examples: [],
  },
  showHover: {
    name: "Show hover",
    defaultSpokenForm: "hover",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Show hover for ${VAR_TARGET}.`,
        cheatsheet: "Show hover",
      },
    ],
    examples: [],
  },
  showQuickFix: {
    name: "Show quick fix",
    defaultSpokenForm: "quick fix",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Show quick fix for ${VAR_TARGET}.`,
        cheatsheet: "Show quick fix",
      },
    ],
    examples: [],
  },
  showReferences: {
    name: "Show references",
    defaultSpokenForm: "reference",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Show references for ${VAR_TARGET}.`,
        cheatsheet: "Show references",
      },
    ],
    examples: [],
  },
  sortTargets: {
    name: "Sort targets",
    defaultSpokenForm: "sort",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Sort ${VAR_TARGET}s.`,
        cheatsheet: "Sort targets",
      },
    ],
    examples: [],
  },
  toggleLineBreakpoint: {
    name: "Toggle line/scope breakpoint",
    defaultSpokenForm: "break point",
    description: "Scope defaults to line.",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Toggle breakpoint on line containing ${VAR_TARGET}.`,
        cheatsheet: "Toggle line breakpoint",
      },
      {
        pattern: `${VAR_SPOKEN_FORM} ${TOKEN_SCOPE} ${VAR_TARGET}`,
        description: `Toggle inline breakpoint at ${VAR_TARGET}.`,
        cheatsheet: "Toggle inline breakpoint",
      },
    ],
    examples: [],
  },
  toggleLineComment: {
    name: "Toggle line comment",
    defaultSpokenForm: "comment",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Toggle line comment at ${VAR_TARGET}.`,
        cheatsheet: "Toggle line comment",
      },
    ],
    examples: [],
  },
  unfoldRegion: {
    name: "Unfold region",
    defaultSpokenForm: "unfold",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Unfold region at ${VAR_TARGET}.`,
        cheatsheet: "Unfold region",
      },
    ],
    examples: [],
  },
  callAsFunction: {
    name: "Call as function",
    defaultSpokenForm: "call",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Insert call to ${VAR_TARGET} on selection.`,
        cheatsheet: `Insert call to ${VAR_TARGET} on selection`,
      },
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_TARGET_1} on ${VAR_TARGET_2}`,
        description: `Insert call to ${VAR_TARGET_1} on ${VAR_TARGET_2}.`,
        cheatsheet: `Insert call to ${VAR_TARGET_1} on ${VAR_TARGET_2}`,
      },
    ],
    examples: [],
  },
  generateSnippet: {
    name: "Generate snippet",
    defaultSpokenForm: "snip make",
    legacySpokenForms: ["snippet make"],
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Generate snippet from ${VAR_TARGET}.`,
        cheatsheet: "Generate snippet",
      },
    ],
    examples: [],
  },
  highlight: {
    name: "Highlight",
    defaultSpokenForm: "highlight",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Highlight ${VAR_TARGET}.`,
        cheatsheet: "Highlight",
      },
    ],
    examples: [],
  },
  insertSnippet: {
    name: "Insert snippet",
    defaultSpokenForm: "snip",
    syntaxes: [
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_SNIPPET} ${VAR_DESTINATION}`,
        description: `Insert snippet at ${VAR_DESTINATION}.`,
        cheatsheet: `Insert snippet at ${VAR_DESTINATION}`,
      },
    ],
    examples: [],
  },
  moveToTarget: {
    name: "Move to target",
    defaultSpokenForm: "move",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Move ${VAR_TARGET} to selection.`,
        cheatsheet: `Move ${VAR_TARGET} to selection`,
      },
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_TARGET} ${VAR_DESTINATION}`,
        description: `Move ${VAR_TARGET} to ${VAR_DESTINATION}.`,
        cheatsheet: `Move ${VAR_TARGET} to ${VAR_DESTINATION}`,
      },
    ],
    examples: [],
  },
  pasteFromClipboard: {
    name: "Paste from clipboard",
    defaultSpokenForm: "paste",
    syntaxes: [
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_DESTINATION}`,
        description: `Paste from clipboard at ${VAR_DESTINATION}.`,
        cheatsheet: `Paste from clipboard at ${VAR_DESTINATION}`,
      },
    ],
    examples: [],
  },
  replaceWithTarget: {
    name: "Replace with target",
    defaultSpokenForm: "bring",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Insert copy of ${VAR_TARGET} at selection.`,
        cheatsheet: `Insert copy of ${VAR_TARGET} at selection`,
      },
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_TARGET} ${VAR_DESTINATION}`,
        description: `Copy ${VAR_TARGET} to ${VAR_DESTINATION}.`,
        cheatsheet: `Copy ${VAR_TARGET} to ${VAR_DESTINATION}`,
      },
    ],
    examples: [],
  },
  rewrapWithPairedDelimiter: {
    name: "Rewrap with paired delimiter",
    defaultSpokenForm: "repack",
    syntaxes: [
      {
        pattern: `${VAR_PAIR} ${VAR_SPOKEN_FORM} ${VAR_TARGET}`,
        description: `Rewrap ${VAR_TARGET} with ${VAR_PAIR}.`,
        cheatsheet: `Rewrap ${VAR_TARGET} with ${VAR_PAIR}`,
      },
    ],
    examples: [],
  },
  swapTargets: {
    name: "Swap targets",
    defaultSpokenForm: "swap",
    syntaxes: [
      {
        pattern: `${VAR_SPOKEN_FORM} ${SWAP_CONNECTIVE} ${VAR_TARGET}`,
        description: `Swap selection with ${VAR_TARGET}.`,
        cheatsheet: `Swap selection with ${VAR_TARGET}`,
      },
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_TARGET_1} ${SWAP_CONNECTIVE} ${VAR_TARGET_2}`,
        description: `Swap ${VAR_TARGET_1} with ${VAR_TARGET_2}.`,
        cheatsheet: `Swap ${VAR_TARGET_1} with ${VAR_TARGET_2}`,
      },
    ],
    examples: [],
  },
  wrapWithPairedDelimiter: {
    name: "Wrap with paired delimiter",
    defaultSpokenForm: "wrap",
    syntaxes: [
      {
        pattern: `${VAR_PAIR} ${VAR_SPOKEN_FORM} ${VAR_TARGET}`,
        description: `Wrap ${VAR_TARGET} with ${VAR_PAIR}.`,
        cheatsheet: `Wrap ${VAR_TARGET} with ${VAR_PAIR}`,
      },
    ],
    examples: [],
  },
  wrapWithSnippet: {
    name: "Wrap with snippet",
    defaultSpokenForm: "wrap",
    syntaxes: [
      {
        pattern: `${VAR_SNIPPET} ${VAR_SPOKEN_FORM} ${VAR_TARGET}`,
        description: `Wrap ${VAR_TARGET} with ${VAR_SNIPPET}.`,
        cheatsheet: `Wrap ${VAR_TARGET} with ${VAR_SNIPPET}`,
      },
    ],
    examples: [],
  },
  applyFormatter: {
    name: "Apply formatter",
    defaultSpokenForm: "format",
    syntaxes: [
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_FORMATTER} at ${VAR_TARGET}`,
        description: `Reformat ${VAR_TARGET} as ${VAR_FORMATTER}.`,
        cheatsheet: `Reformat ${VAR_TARGET} as ${VAR_FORMATTER}`,
      },
    ],
    examples: [],
  },
  nextHomophone: {
    name: "Next homophone",
    defaultSpokenForm: "phones",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Cycle to next homophone for ${VAR_TARGET}.`,
        cheatsheet: "Cycle to next homophone",
      },
    ],
    examples: [],
  },

  // Private actions --------------------

  "private.showParseTree": {
    name: "Show parse tree",
    defaultSpokenForm: "parse tree",
    private: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Show parse tree for ${VAR_TARGET}.`,
        cheatsheet: "Show parse tree",
      },
    ],
    examples: [],
  },
  parsed: {
    name: "Parsed",
    defaultSpokenForm: "parsed",
    private: true,
    syntaxes: [],
    examples: [],
  },
  "private.getTargets": {
    name: "Get targets",
    defaultSpokenForm: "get targets",
    private: true,
    syntaxes: [],
    examples: [],
  },
  "private.setKeyboardTarget": {
    name: "Set keyboard target",
    defaultSpokenForm: "set keyboard target",
    private: true,
    syntaxes: [],
    examples: [],
  },
  executeCommand: {
    name: "Execute command",
    defaultSpokenForm: "execute command",
    private: true,
    syntaxes: [],
    examples: [],
  },
  editNew: {
    name: "Edit new",
    defaultSpokenForm: "edit new",
    private: true,
    syntaxes: [],
    examples: [],
  },
  getText: {
    name: "Get text",
    defaultSpokenForm: "get text",
    private: true,
    syntaxes: [],
    examples: [],
  },
  replace: {
    name: "Replace",
    defaultSpokenForm: "replace",
    private: true,
    syntaxes: [],
    examples: [],
  },
};
