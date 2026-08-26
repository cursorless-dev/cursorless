import type { ActionType } from "../types/command/ActionDescriptor";
import type { ReferenceEntryWithoutIdKind } from "../types/ReferenceEntry";

const DEFAULT_PATTERN = "<spokenForm> <target>";
const DEFAULT_PATTERN_SCOPE = "<spokenForm> <scope> <target>";

type TalonSideActionType = "applyFormatter" | "nextHomophone";

const actionReferencesMap: Record<
  ActionType | TalonSideActionType,
  ReferenceEntryWithoutIdKind
> = {
  addSelection: {
    name: "Add selection",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Adds <target> to the current selection set",
        descriptionShort: "Add selection",
      },
    ],
    examples: [],
  },
  addSelectionAfter: {
    name: "Add selection after",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Adds empty selection after <target> to the current selection set",
        descriptionShort: "Add selection after",
      },
    ],
    examples: [],
  },
  addSelectionBefore: {
    name: "Add selection before",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Adds empty selection before <target> to the current selection set",
        descriptionShort: "Add selection before",
      },
    ],
    examples: [],
  },
  breakLine: {
    name: "Break line",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Breaks the line before <target>",
        descriptionShort: "Breaks the line",
      },
    ],
    examples: [],
  },
  clearAndSetSelection: {
    name: "Change",
    legacySpokenForms: ["clear"],
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Change <target> by clearing it and setting a new selection",
        descriptionShort: "Change",
      },
    ],
    examples: [],
  },
  copyToClipboard: {
    name: "Copy to clipboard",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Copy <target> to clipboard",
        descriptionShort: "Copy to clipboard",
      },
    ],
    examples: [],
  },
  cutToClipboard: {
    name: "Cut to clipboard",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Cut <target> to clipboard",
        descriptionShort: "Cut to clipboard",
      },
    ],
    examples: [],
  },
  decrement: {
    name: "Decrement",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Decrement number at <target>",
        descriptionShort: "Decrement number",
      },
    ],
    examples: [],
  },
  deselect: {
    name: "Deselect",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Deselect <target>",
        descriptionShort: "Deselect",
      },
    ],
    examples: [],
  },
  editNewLineAfter: {
    name: "Edit new line/scope after",
    description: "Scope defaults to line",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Edit new line after <target>",
        descriptionShort: "Edit new line after",
      },
      {
        pattern: DEFAULT_PATTERN_SCOPE,
        description: "Edit new <scope> after <target>",
        descriptionShort: "Edit new <scope> after",
      },
    ],
    examples: [],
  },
  editNewLineBefore: {
    name: "Edit new line/scope before",
    description: "Scope defaults to line",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Edit new line before <target>",
        descriptionShort: "Edit new line before",
      },
      {
        pattern: DEFAULT_PATTERN_SCOPE,
        description: "Edit new <scope> before <target>",
        descriptionShort: "Edit new <scope> before",
      },
    ],
    examples: [],
  },
  "experimental.setInstanceReference": {
    name: "Set instance reference",
    description:
      "Sets the instance reference for the next 'instance of' action",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Set instance reference to <target>",
        descriptionShort: "Set instance reference",
      },
    ],
    examples: [],
  },
  extractVariable: {
    name: "Extract variable",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Extract variable from <target>",
        descriptionShort: "Extract variable",
      },
    ],
    examples: [],
  },
  findInDocument: {
    name: "Find in document",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Find <target> in document",
        descriptionShort: "Find in document",
      },
    ],
    examples: [],
  },
  findInWorkspace: {
    name: "Find in workspace",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Find <target> in workspace",
        descriptionShort: "Find in workspace",
      },
    ],
    examples: [],
  },
  flashTargets: {
    name: "Flash target",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Flash <target>",
        descriptionShort: "Flash target",
      },
    ],
    examples: [],
  },
  foldRegion: {
    name: "Fold region",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Fold region at <target>",
        descriptionShort: "Fold region",
      },
    ],
    examples: [],
  },
  followLink: {
    name: "Follow link",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Follow link at <target>",
        descriptionShort: "Follow link",
      },
    ],
    examples: [],
  },
  followLinkAside: {
    name: "Follow link aside",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Follow link at <target> aside (e.g. in a split view)",
        descriptionShort: "Follow link aside",
      },
    ],
    examples: [],
  },
  gitAccept: {
    name: "Git accept",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Accept Git change at <target>",
        descriptionShort: "Git accept",
      },
    ],
    examples: [],
  },
  gitRevert: {
    name: "Git revert",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Revert Git change at <target>",
        descriptionShort: "Git revert",
      },
    ],
    examples: [],
  },
  gitStage: {
    name: "Git stage",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Stage Git change at <target>",
        descriptionShort: "Git stage",
      },
    ],
    examples: [],
  },
  gitUnstage: {
    name: "Git unstage",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Unstage Git change at <target>",
        descriptionShort: "Git unstage",
      },
    ],
    examples: [],
  },
  increment: {
    name: "Increment",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Increment number at <target>",
        descriptionShort: "Increment number",
      },
    ],
    examples: [],
  },
  indentLine: {
    name: "Indent line",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Indent line containing <target>",
        descriptionShort: "Indent line",
      },
    ],
    examples: [],
  },
  insertCopyAfter: {
    name: "Insert copy after",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Insert copy after <target>",
        descriptionShort: "Insert copy after",
      },
    ],
    examples: [],
  },
  insertCopyBefore: {
    name: "Insert copy before",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Insert copy before <target>",
        descriptionShort: "Insert copy before",
      },
    ],
    examples: [],
  },
  insertEmptyLineAfter: {
    name: "Insert empty line after",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Insert empty line after <target>",
        descriptionShort: "Insert empty line after",
      },
    ],
    examples: [],
  },
  insertEmptyLineBefore: {
    name: "Insert empty line before",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Insert empty line before <target>",
        descriptionShort: "Insert empty line before",
      },
    ],
    examples: [],
  },
  insertEmptyLinesAround: {
    name: "Insert empty lines around",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Insert empty lines around <target>",
        descriptionShort: "Insert empty lines around",
      },
    ],
    examples: [],
  },
  joinLines: {
    name: "Join lines",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Join lines at <target>",
        descriptionShort: "Join lines",
      },
    ],
    examples: [],
  },
  outdentLine: {
    name: "Outdent line",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Outdent line containing <target>",
        descriptionShort: "Outdent line",
      },
    ],
    examples: [],
  },
  randomizeTargets: {
    name: "Randomize targets",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Randomize <target>s",
        descriptionShort: "Randomize targets",
      },
    ],
    examples: [],
  },
  remove: {
    name: "Remove",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Remove <target>",
        descriptionShort: "Remove",
      },
    ],
    examples: [],
  },
  rename: {
    name: "Rename",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Rename <target>",
        descriptionShort: "Rename",
      },
    ],
    examples: [],
  },
  revealDefinition: {
    name: "Reveal definition",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Reveal definition of <target>",
        descriptionShort: "Reveal definition",
      },
    ],
    examples: [],
  },
  revealTypeDefinition: {
    name: "Reveal type definition",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Reveal type definition of <target>",
        descriptionShort: "Reveal type definition",
      },
    ],
    examples: [],
  },
  reverseTargets: {
    name: "Reverse targets",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Reverse <target>s",
        descriptionShort: "Reverse targets",
      },
    ],
    examples: [],
  },
  scrollToBottom: {
    name: "Scroll to bottom",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Scroll <target> to bottom of the viewport",
        descriptionShort: "Scroll to bottom",
      },
    ],
    examples: [],
  },
  scrollToCenter: {
    name: "Scroll to center",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Scroll <target> to center of the viewport",
        descriptionShort: "Scroll to center",
      },
    ],
    examples: [],
  },
  scrollToTop: {
    name: "Scroll to top",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Scroll <target> to top of the viewport",
        descriptionShort: "Scroll to top",
      },
    ],
    examples: [],
  },
  setSelection: {
    name: "Set selection",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Set selection to <target>",
        descriptionShort: "Set selection",
      },
    ],
    examples: [],
  },
  setSelectionAfter: {
    name: "Set selection after",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Set empty selection after <target>",
        descriptionShort: "Set selection after",
      },
    ],
    examples: [],
  },
  setSelectionBefore: {
    name: "Set selection before",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Set empty selection before <target>",
        descriptionShort: "Set selection before",
      },
    ],
    examples: [],
  },
  showDebugHover: {
    name: "Show debug hover",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Show debug hover for <target>",
        descriptionShort: "Show debug hover",
      },
    ],
    examples: [],
  },
  showHover: {
    name: "Show hover",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Show hover for <target>",
        descriptionShort: "Show hover",
      },
    ],
    examples: [],
  },
  showQuickFix: {
    name: "Show quick fix",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Show quick fix for <target>",
        descriptionShort: "Show quick fix",
      },
    ],
    examples: [],
  },
  showReferences: {
    name: "Show references",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Show references for <target>",
        descriptionShort: "Show references",
      },
    ],
    examples: [],
  },
  sortTargets: {
    name: "Sort targets",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Sort <target>s",
        descriptionShort: "Sort targets",
      },
    ],
    examples: [],
  },
  toggleLineBreakpoint: {
    name: "Toggle line/scope breakpoint",
    description: "Scope defaults to line",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Toggle breakpoint on line containing <target>",
        descriptionShort: "Toggle line breakpoint",
      },
      {
        pattern: "<spokenForm> token <target>",
        description: "Toggle inline breakpoint at <target>",
        descriptionShort: "Toggle inline breakpoint",
      },
    ],
    examples: [],
  },
  toggleLineComment: {
    name: "Toggle line comment",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Toggle line comment at <target>",
        descriptionShort: "Toggle line comment",
      },
    ],
    examples: [],
  },
  unfoldRegion: {
    name: "Unfold region",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Unfold region at <target>",
        descriptionShort: "Unfold region",
      },
    ],
    examples: [],
  },
  callAsFunction: {
    name: "Call as function",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Insert call to <target> on selection",
        descriptionShort: "Insert call to <target> on selection",
      },
      {
        pattern: "<spokenForm> <target 1> on <target 2>",
        description: "Insert call to <target 1> on <target 2>",
        descriptionShort: "Insert call to <target 1> on <target 2>",
      },
    ],
    examples: [],
  },
  generateSnippet: {
    name: "Generate snippet",
    legacySpokenForms: ["snippet make"],
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Generate snippet from <target>",
        descriptionShort: "Generate snippet",
      },
    ],
    examples: [],
  },
  highlight: {
    name: "Highlight",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Highlight <target>",
        descriptionShort: "Highlight",
      },
    ],
    examples: [],
  },
  insertSnippet: {
    name: "Insert snippet",
    syntaxes: [
      {
        pattern: "<spokenForm> <snippet> <destination>",
        description: "Insert snippet at <destination>",
        descriptionShort: "Insert snippet at <destination>",
      },
    ],
    examples: [],
  },
  moveToTarget: {
    name: "Move to target",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Move <target> to selection",
        descriptionShort: "Move <target> to selection",
      },
      {
        pattern: "<spokenForm> <target> <destination>",
        description: "Move <target> to <destination>",
        descriptionShort: "Move <target> to <destination>",
      },
    ],
    examples: [],
  },
  pasteFromClipboard: {
    name: "Paste from clipboard",
    syntaxes: [
      {
        pattern: "<spokenForm> <destination>",
        description: "Paste from clipboard at <destination>",
        descriptionShort: "Paste from clipboard at <destination>",
      },
    ],
    examples: [],
  },
  replaceWithTarget: {
    name: "Replace with target",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Insert copy of <target> at selection",
        descriptionShort: "Insert copy of <target> at selection",
      },
      {
        pattern: "<spokenForm> <target> <destination>",
        description: "Copy <target> to <destination>",
        descriptionShort: "Copy <target> to <destination>",
      },
    ],
    examples: [],
  },
  rewrapWithPairedDelimiter: {
    name: "Rewrap with paired delimiter",
    syntaxes: [
      {
        pattern: "<pair> <spokenForm> <target>",
        description: "Rewrap <target> with <pair>",
        descriptionShort: "Rewrap <target> with <pair>",
      },
    ],
    examples: [],
  },
  swapTargets: {
    name: "Swap targets",
    syntaxes: [
      {
        pattern: "<spokenForm> <swapConnective> <target>",
        description: "Swap selection with <target>",
        descriptionShort: "Swap selection with <target>",
      },
      {
        pattern: "<spokenForm> <target 1> <swapConnective> <target 2>",
        description: "Swap <target 1> with <target 2>",
        descriptionShort: "Swap <target 1> with <target 2>",
      },
    ],
    examples: [],
  },
  wrapWithPairedDelimiter: {
    name: "Wrap with paired delimiter",
    syntaxes: [
      {
        pattern: "<pair> <spokenForm> <target>",
        description: "Wrap <target> with <pair>",
        descriptionShort: "Wrap <target> with <pair>",
      },
    ],
    examples: [],
  },
  wrapWithSnippet: {
    name: "Wrap with snippet",
    syntaxes: [
      {
        pattern: "<snippet> <spokenForm> <target>",
        description: "Wrap <target> with <snippet>",
        descriptionShort: "Wrap <target> with <snippet>",
      },
    ],
    examples: [],
  },
  applyFormatter: {
    name: "Apply formatter",
    syntaxes: [
      {
        pattern: "<spokenForm> <formatter> at <target>",
        description: "Reformat <target> as <formatter>",
        descriptionShort: "Reformat <target> as <formatter>",
      },
    ],
    examples: [],
  },
  nextHomophone: {
    name: "Next homophone",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Cycle to next homophone for <target>",
        descriptionShort: "Cycle to next homophone",
      },
    ],
    examples: [],
  },

  // Private actions, but that has spoken forms
  "private.showParseTree": {
    name: "Show parse tree",
    private: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Show parse tree for <target>",
        descriptionShort: "Show parse tree",
      },
    ],
    examples: [],
  },

  // Actions without spoken forms
  parsed: {
    name: "Parsed",
    private: true,
    syntaxes: [],
    examples: [],
  },
  "private.getTargets": {
    name: "Get targets",
    private: true,
    syntaxes: [],
    examples: [],
  },
  "private.setKeyboardTarget": {
    name: "Set keyboard target",
    private: true,
    syntaxes: [],
    examples: [],
  },
  executeCommand: {
    name: "Execute command",
    private: true,
    syntaxes: [],
    examples: [],
  },
  editNew: {
    name: "Edit new",
    private: true,
    syntaxes: [],
    examples: [],
  },
  getText: {
    name: "Get text",
    private: true,
    syntaxes: [],
    examples: [],
  },
  replace: {
    name: "Replace",
    private: true,
    syntaxes: [],
    examples: [],
  },
};
