import type { ActionType } from "../types/command/ActionDescriptor";
import type { ReferenceEntry } from "./ReferenceEntry";

const DEFAULT_PATTERN = "<spokenForm> <target>";
const DEFAULT_PATTERN_SCOPE = "<spokenForm> <scope> <target>";

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
        description: "Adds <target> to the current selection set",
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
        description:
          "Adds empty selection after <target> to the current selection set",
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
        description:
          "Adds empty selection before <target> to the current selection set",
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
        description: "Breaks the line before <target>",
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
        description:
          "Change <target> by clearing it and setting a new selection",
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
        description: "Copy <target> to clipboard",
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
        description: "Cut <target> to clipboard",
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
        description: "Decrement number at <target>",
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
        description: "Deselect <target>",
        cheatsheet: "Deselect",
      },
    ],
    examples: [],
  },
  editNewLineAfter: {
    name: "Edit new line/scope after",
    defaultSpokenForm: "pour",
    description: "Scope defaults to line",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Edit new line after <target>",
        cheatsheet: "Edit new line after",
      },
      {
        pattern: DEFAULT_PATTERN_SCOPE,
        description: "Edit new <scope> after <target>",
        cheatsheet: "Edit new <scope> after",
      },
    ],
    examples: [],
  },
  editNewLineBefore: {
    name: "Edit new line/scope before",
    defaultSpokenForm: "drink",
    description: "Scope defaults to line",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Edit new line before <target>",
        cheatsheet: "Edit new line before",
      },
      {
        pattern: DEFAULT_PATTERN_SCOPE,
        description: "Edit new <scope> before <target>",
        cheatsheet: "Edit new <scope> before",
      },
    ],
    examples: [],
  },
  "experimental.setInstanceReference": {
    name: "Set instance reference",
    defaultSpokenForm: "from",
    description:
      "Sets the instance reference for the next 'instance of' action",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Set instance reference to <target>",
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
        description: "Extract variable from <target>",
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
        description: "Find <target> in document",
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
        description: "Find <target> in workspace",
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
        description: "Flash <target>",
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
        description: "Fold region at <target>",
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
        description: "Follow link at <target>",
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
        description: "Follow link at <target> aside (e.g. in a split view)",
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
        description: "Accept Git change at <target>",
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
        description: "Revert Git change at <target>",
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
        description: "Stage Git change at <target>",
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
        description: "Unstage Git change at <target>",
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
        description: "Increment number at <target>",
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
        description: "Indent line containing <target>",
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
        description: "Insert copy after <target>",
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
        description: "Insert copy before <target>",
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
        description: "Insert empty line after <target>",
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
        description: "Insert empty line before <target>",
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
        description: "Insert empty lines around <target>",
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
        description: "Join lines at <target>",
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
        description: "Outdent line containing <target>",
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
        description: "Randomize <target>s",
        cheatsheet: "Randomize targets",
      },
    ],
    examples: [],
  },
  remove: {
    name: "Remove",
    defaultSpokenForm: "chuck",
    description:
      "This action can be used to remove a target without moving the cursor",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Remove <target>",
        cheatsheet: "Remove",
      },
    ],
    examples: [
      {
        spokenForm: "<spokenForm> blue air",
        description: "Removes the token containing letter 'a' with a blue hat.",
      },
    ],
  },
  rename: {
    name: "Rename",
    defaultSpokenForm: "rename",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Rename <target>",
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
        description: "Reveal definition of <target>",
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
        description: "Reveal type definition of <target>",
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
        description: "Reverse <target>s",
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
        description: "Scroll <target> to bottom of the viewport",
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
        description: "Scroll <target> to center of the viewport",
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
        description: "Scroll <target> to top of the viewport",
        cheatsheet: "Scroll to top",
      },
    ],
    examples: [],
  },
  setSelection: {
    name: "Set selection",
    defaultSpokenForm: "take",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Set selection to <target>",
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
        description: "Set empty selection after <target>",
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
        description: "Set empty selection before <target>",
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
        description: "Show debug hover for <target>",
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
        description: "Show hover for <target>",
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
        description: "Show quick fix for <target>",
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
        description: "Show references for <target>",
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
        description: "Sort <target>s",
        cheatsheet: "Sort targets",
      },
    ],
    examples: [],
  },
  toggleLineBreakpoint: {
    name: "Toggle line/scope breakpoint",
    defaultSpokenForm: "break point",
    description: "Scope defaults to line",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Toggle breakpoint on line containing <target>",
        cheatsheet: "Toggle line breakpoint",
      },
      {
        pattern: "<spokenForm> token <target>",
        description: "Toggle inline breakpoint at <target>",
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
        description: "Toggle line comment at <target>",
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
        description: "Unfold region at <target>",
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
        description: "Insert call to <target> on selection",
        cheatsheet: "Insert call to <target> on selection",
      },
      {
        pattern: "<spokenForm> <target 1> on <target 2>",
        description: "Insert call to <target 1> on <target 2>",
        cheatsheet: "Insert call to <target 1> on <target 2>",
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
        description: "Generate snippet from <target>",
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
        description: "Highlight <target>",
        cheatsheet: "Highlight",
      },
    ],
    examples: [],
  },
  insertSnippet: {
    name: "Insert snippet",
    defaultSpokenForm: "snippet",
    syntaxes: [
      {
        pattern: "<spokenForm> <snippet> <destination>",
        description: "Insert snippet at <destination>",
        cheatsheet: "Insert snippet at <destination>",
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
        description: "Move <target> to selection",
        cheatsheet: "Move <target> to selection",
      },
      {
        pattern: "<spokenForm> <target> <destination>",
        description: "Move <target> to <destination>",
        cheatsheet: "Move <target> to <destination>",
      },
    ],
    examples: [],
  },
  pasteFromClipboard: {
    name: "Paste from clipboard",
    defaultSpokenForm: "paste",
    syntaxes: [
      {
        pattern: "<spokenForm> <destination>",
        description: "Paste from clipboard at <destination>",
        cheatsheet: "Paste from clipboard at <destination>",
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
        description: "Insert copy of <target> at selection",
        cheatsheet: "Insert copy of <target> at selection",
      },
      {
        pattern: "<spokenForm> <target> <destination>",
        description: "Copy <target> to <destination>",
        cheatsheet: "Copy <target> to <destination>",
      },
    ],
    examples: [],
  },
  rewrapWithPairedDelimiter: {
    name: "Rewrap with paired delimiter",
    defaultSpokenForm: "repack",
    syntaxes: [
      {
        pattern: "<pair> <spokenForm> <target>",
        description: "Rewrap <target> with <pair>",
        cheatsheet: "Rewrap <target> with <pair>",
      },
    ],
    examples: [],
  },
  swapTargets: {
    name: "Swap targets",
    defaultSpokenForm: "swap",
    syntaxes: [
      {
        pattern: "<spokenForm> <swapConnective> <target>",
        description: "Swap selection with <target>",
        cheatsheet: "Swap selection with <target>",
      },
      {
        pattern: "<spokenForm> <target 1> <swapConnective> <target 2>",
        description: "Swap <target 1> with <target 2>",
        cheatsheet: "Swap <target 1> with <target 2>",
      },
    ],
    examples: [],
  },
  wrapWithPairedDelimiter: {
    name: "Wrap with paired delimiter",
    defaultSpokenForm: "wrap",
    syntaxes: [
      {
        pattern: "<pair> <spokenForm> <target>",
        description: "Wrap <target> with <pair>",
        cheatsheet: "Wrap <target> with <pair>",
      },
    ],
    examples: [],
  },
  wrapWithSnippet: {
    name: "Wrap with snippet",
    defaultSpokenForm: "wrap",
    syntaxes: [
      {
        pattern: "<snippet> <spokenForm> <target>",
        description: "Wrap <target> with <snippet>",
        cheatsheet: "Wrap <target> with <snippet>",
      },
    ],
    examples: [],
  },
  applyFormatter: {
    name: "Apply formatter",
    defaultSpokenForm: "format",
    syntaxes: [
      {
        pattern: "<spokenForm> <formatter> at <target>",
        description: "Reformat <target> as <formatter>",
        cheatsheet: "Reformat <target> as <formatter>",
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
        description: "Cycle to next homophone for <target>",
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
        description: "Show parse tree for <target>",
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
