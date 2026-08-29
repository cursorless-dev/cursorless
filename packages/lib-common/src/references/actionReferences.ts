import type { ActionType } from "../types/command/ActionDescriptor";
import {
  FORMATTER_CAMEL,
  REMOVE,
  SET_SELECTION,
  SNIPPET_IF,
  TARGET,
  TARGET_2,
  TARGET_2_DESC,
  TARGET_DESC,
  TARGET_NUMBER,
  TARGET_NUMBER_DESC,
  VAR_DESTINATION,
  VAR_FORMATTER,
  VAR_PAIR,
  VAR_SCOPE,
  VAR_SNIPPET,
  VAR_SPOKEN_FORM,
  VAR_TARGET,
  VAR_TARGET_1,
  VAR_TARGET_2,
} from "./constants";
import { modifierReferences } from "./modifierReferences";
import { pairedDelimiterReferences } from "./pairedDelimiterReferences";
import type { ActionReferenceEntry } from "./ReferenceEntry";
import { scopeReferences } from "./scopeReferences";
import { connectiveDefaultSpokenForms } from "./spokenForms/connectiveDefaultSpokenForms";

const DEFAULT_PATTERN = `${VAR_SPOKEN_FORM} ${VAR_TARGET}`;
const DEFAULT_COMMAND = `${VAR_SPOKEN_FORM} ${TARGET}`;

const ITEM = scopeReferences.collectionItem.defaultSpokenForm;
const VALUE = scopeReferences.value.defaultSpokenForm;
const INSTANCE = scopeReferences.instance.defaultSpokenForm;
const FUNCTION = scopeReferences.namedFunction.defaultSpokenForm;
const TOKEN = scopeReferences.token.defaultSpokenForm;
const EVERY = modifierReferences.everyScope.defaultSpokenForm;
const WITH = connectiveDefaultSpokenForms.swapConnective;
const AFTER = connectiveDefaultSpokenForms.after;
const TO = connectiveDefaultSpokenForms.sourceDestinationConnective;
const CURLY = pairedDelimiterReferences.curlyBrackets.defaultSpokenForm;
const SQUARE = pairedDelimiterReferences.squareBrackets.defaultSpokenForm;
const AT = connectiveDefaultSpokenForms.at;
const ON = connectiveDefaultSpokenForms.on;

type TalonSideActionType = "applyFormatter" | "nextHomophone";

export const actionReferences = {
  setSelection: {
    name: "Set selection",
    defaultSpokenForm: SET_SELECTION,
    group: {
      id: "cursor",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Set selection to ${VAR_TARGET}.`,
        cheatsheet: "Set selection",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Selects the ${TARGET_DESC}.`,
      },
    ],
  },
  setSelectionBefore: {
    name: "Set selection before",
    defaultSpokenForm: "pre",
    group: {
      id: "cursor",
      index: 1,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Set empty selection before ${VAR_TARGET}.`,
        cheatsheet: "Set selection before",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Places the cursor before the ${TARGET_DESC}.`,
      },
    ],
  },
  setSelectionAfter: {
    name: "Set selection after",
    defaultSpokenForm: "post",
    group: {
      id: "cursor",
      index: 2,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Set empty selection after ${VAR_TARGET}.`,
        cheatsheet: "Set selection after",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Places the cursor after the ${TARGET_DESC}.`,
      },
    ],
  },
  addSelection: {
    name: "Add selection",
    defaultSpokenForm: "append",
    group: {
      id: "cursor",
      index: 3,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Adds ${VAR_TARGET} to the current selection set.`,
        cheatsheet: "Add selection",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Adds the ${TARGET_DESC} to the current selections.`,
      },
    ],
  },
  addSelectionBefore: {
    name: "Add selection before",
    defaultSpokenForm: "append pre",
    group: {
      id: "cursor",
      index: 4,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Adds empty selection before ${VAR_TARGET} to the current selection set.`,
        cheatsheet: "Add selection before",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Adds an empty selection before the ${TARGET_DESC}.`,
      },
    ],
  },
  addSelectionAfter: {
    name: "Add selection after",
    defaultSpokenForm: "append post",
    group: {
      id: "cursor",
      index: 5,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Adds empty selection after ${VAR_TARGET} to the current selection set.`,
        cheatsheet: "Add selection after",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Adds an empty selection after the ${TARGET_DESC}.`,
      },
    ],
  },
  deselect: {
    name: "Deselect",
    defaultSpokenForm: "give",
    group: {
      id: "cursor",
      index: 6,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Deselect ${VAR_TARGET}.`,
        cheatsheet: "Deselect",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Removes the ${TARGET_DESC} from the current selections.`,
      },
    ],
  },

  breakLine: {
    name: "Break line",
    defaultSpokenForm: "break",
    group: {
      id: "break",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Breaks the line before ${VAR_TARGET}.`,
        cheatsheet: "Breaks the line",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Breaks the line before the ${TARGET_DESC}.`,
      },
    ],
  },
  clearAndSetSelection: {
    name: "Change",
    defaultSpokenForm: "change",
    group: {
      id: "change",
      index: 1,
    },
    legacySpokenForms: ["clear"],
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Change ${VAR_TARGET} by clearing it and leaving the cursor in its place.`,
        cheatsheet: "Change",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Changes the ${TARGET_DESC} by clearing it and leaving the cursor in its place.`,
      },
    ],
  },
  copyToClipboard: {
    name: "Copy to clipboard",
    defaultSpokenForm: "copy",
    group: {
      id: "clipboard",
      index: 1,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Copy ${VAR_TARGET} to clipboard.`,
        cheatsheet: "Copy to clipboard",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Copies the ${TARGET_DESC} to the clipboard.`,
      },
    ],
  },
  cutToClipboard: {
    name: "Cut to clipboard",
    defaultSpokenForm: "carve",
    group: {
      id: "clipboard",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Cut ${VAR_TARGET} to clipboard.`,
        cheatsheet: "Cut to clipboard",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Cuts the ${TARGET_DESC} to the clipboard.`,
      },
    ],
  },
  decrement: {
    name: "Decrement",
    defaultSpokenForm: "decrement",
    group: {
      id: "numbers",
      index: 1,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Decrement number at ${VAR_TARGET}.`,
        cheatsheet: "Decrement number",
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${TARGET_NUMBER}`,
        description: `Decrements the number at the ${TARGET_NUMBER_DESC}.`,
      },
    ],
  },
  editNewLineAfter: {
    name: "Edit new line/scope after",
    defaultSpokenForm: "pour",
    group: {
      id: "emptyLines",
      index: 1,
    },
    description: "Scope defaults to line.",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Edit new line after ${VAR_TARGET}.`,
        cheatsheet: "Edit new line after",
      },
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_SCOPE} ${VAR_TARGET}`,
        description: `Edit new ${VAR_SCOPE} after ${VAR_TARGET}.`,
        cheatsheet: `Edit new ${VAR_SCOPE} after`,
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Inserts a new line below the ${TARGET_DESC} and moves the cursor to it.`,
      },
      {
        command: `${VAR_SPOKEN_FORM} ${ITEM} ${TARGET}`,
        description: `Inserts the delimiters for a new collection item after the item containing the ${TARGET_DESC} and moves the cursor there.`,
      },
    ],
  },
  editNewLineBefore: {
    name: "Edit new line/scope before",
    defaultSpokenForm: "drink",
    group: {
      id: "emptyLines",
      index: 0,
    },
    description: "Scope defaults to line.",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Edit new line before ${VAR_TARGET}.`,
        cheatsheet: "Edit new line before",
      },
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_SCOPE} ${VAR_TARGET}`,
        description: `Edit new ${VAR_SCOPE} before ${VAR_TARGET}.`,
        cheatsheet: `Edit new ${VAR_SCOPE} before`,
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Inserts a new line above the ${TARGET_DESC} and moves the cursor to it.`,
      },
      {
        command: `${VAR_SPOKEN_FORM} ${ITEM} ${TARGET}`,
        description: `Inserts the delimiters for a new collection item before the item containing the ${TARGET_DESC} and moves the cursor there.`,
      },
    ],
  },
  "experimental.setInstanceReference": {
    name: "Set instance reference",
    defaultSpokenForm: "from",
    group: {
      id: "targetContext",
      index: 0,
    },
    description:
      "Sets the instance reference for the next 'instance of' action.",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Set instance reference to ${VAR_TARGET}.`,
        cheatsheet: "Set instance reference",
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${FUNCTION} ${TARGET} ${SET_SELECTION} ${EVERY} ${INSTANCE} ${TARGET_2}`,
        description: `Selects every instance of the ${TARGET_2_DESC} within the function containing the ${TARGET_DESC}.`,
      },
    ],
  },
  extractVariable: {
    name: "Extract variable",
    defaultSpokenForm: "extract",
    group: {
      id: "extract",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Extract variable from ${VAR_TARGET}.`,
        cheatsheet: "Extract variable",
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${VALUE} ${TARGET}`,
        description: `Extracts the value containing the ${TARGET_DESC} into a variable.`,
      },
    ],
  },
  findInDocument: {
    name: "Find in document",
    defaultSpokenForm: "scout",
    group: {
      id: "navigation",
      index: 5,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Find ${VAR_TARGET} in document.`,
        cheatsheet: "Find in document",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Searches the current document for the ${TARGET_DESC}.`,
      },
    ],
  },
  findInWorkspace: {
    name: "Find in workspace",
    defaultSpokenForm: "scout all",
    group: {
      id: "navigation",
      index: 6,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Find ${VAR_TARGET} in workspace.`,
        cheatsheet: "Find in workspace",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Searches the workspace for the ${TARGET_DESC}.`,
      },
    ],
  },
  flashTargets: {
    name: "Flash target",
    defaultSpokenForm: "flash",
    group: {
      id: "visual",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Flash ${VAR_TARGET}.`,
        cheatsheet: "Flash target",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Briefly flashes the ${TARGET_DESC}.`,
      },
    ],
  },
  foldRegion: {
    name: "Fold region",
    defaultSpokenForm: "fold",
    group: {
      id: "folding",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Fold region at ${VAR_TARGET}.`,
        cheatsheet: "Fold region",
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${FUNCTION} ${TARGET}`,
        description: `Folds the function containing the ${TARGET_DESC}.`,
      },
    ],
  },
  followLink: {
    name: "Follow link",
    defaultSpokenForm: "follow",
    group: {
      id: "navigation",
      index: 7,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Follow link at ${VAR_TARGET}.`,
        cheatsheet: "Follow link",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Opens the link containing the ${TARGET_DESC}.`,
      },
    ],
  },
  followLinkAside: {
    name: "Follow link aside",
    defaultSpokenForm: "follow split",
    group: {
      id: "navigation",
      index: 8,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Follow link at ${VAR_TARGET} aside (e.g. in a split view).`,
        cheatsheet: "Follow link aside",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Opens the link containing the ${TARGET_DESC} in a split view.`,
      },
    ],
  },
  gitAccept: {
    name: "Git accept",
    defaultSpokenForm: "git accept",
    group: {
      id: "git",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Accept Git change at ${VAR_TARGET}.`,
        cheatsheet: "Git accept",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Accepts the Git change on the line containing the ${TARGET_DESC}.`,
      },
    ],
  },
  gitRevert: {
    name: "Git revert",
    defaultSpokenForm: "git revert",
    group: {
      id: "git",
      index: 1,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Revert Git change at ${VAR_TARGET}.`,
        cheatsheet: "Git revert",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Reverts the Git change on the line containing the ${TARGET_DESC}.`,
      },
    ],
  },
  gitStage: {
    name: "Git stage",
    defaultSpokenForm: "git stage",
    group: {
      id: "git",
      index: 2,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Stage Git change at ${VAR_TARGET}.`,
        cheatsheet: "Git stage",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Stages the Git change on the line containing the ${TARGET_DESC}.`,
      },
    ],
  },
  gitUnstage: {
    name: "Git unstage",
    defaultSpokenForm: "git unstage",
    group: {
      id: "git",
      index: 3,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Unstage Git change at ${VAR_TARGET}.`,
        cheatsheet: "Git unstage",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Unstages the Git change on the line containing the ${TARGET_DESC}.`,
      },
    ],
  },
  increment: {
    name: "Increment",
    defaultSpokenForm: "increment",
    group: {
      id: "numbers",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Increment number at ${VAR_TARGET}.`,
        cheatsheet: "Increment number",
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${TARGET_NUMBER}`,
        description: `Increments the ${TARGET_NUMBER_DESC}.`,
      },
    ],
  },
  indentLine: {
    name: "Indent line",
    defaultSpokenForm: "indent",
    group: {
      id: "indentation",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Indent line containing ${VAR_TARGET}.`,
        cheatsheet: "Indent line",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Indents the line containing the ${TARGET_DESC}.`,
      },
    ],
  },
  insertCopyAfter: {
    name: "Insert copy after",
    defaultSpokenForm: "clone",
    group: {
      id: "clone",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Insert copy after ${VAR_TARGET}.`,
        cheatsheet: "Insert copy after",
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${FUNCTION} ${TARGET}`,
        description: `Inserts a copy of the function containing the ${TARGET_DESC} after itself.`,
      },
    ],
  },
  insertCopyBefore: {
    name: "Insert copy before",
    defaultSpokenForm: "clone up",
    group: {
      id: "clone",
      index: 1,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Insert copy before ${VAR_TARGET}.`,
        cheatsheet: "Insert copy before",
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${FUNCTION} ${TARGET}`,
        description: `Inserts a copy of the function containing the ${TARGET_DESC} before itself.`,
      },
    ],
  },
  insertEmptyLineAfter: {
    name: "Insert empty line/scope after",
    defaultSpokenForm: "float",
    group: {
      id: "emptyLines",
      index: 3,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Insert empty line/scope after ${VAR_TARGET}.`,
        cheatsheet: "Insert empty line/scope after",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Inserts an empty line below the ${TARGET_DESC} without moving the cursor.`,
      },
      {
        command: `${VAR_SPOKEN_FORM} ${ITEM} ${TARGET}`,
        description: `Inserts the required delimiter after the collection item containing the ${TARGET_DESC}.`,
      },
    ],
  },
  insertEmptyLineBefore: {
    name: "Insert empty line/scope before",
    defaultSpokenForm: "drop",
    group: {
      id: "emptyLines",
      index: 2,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Insert empty line/scope before ${VAR_TARGET}.`,
        cheatsheet: "Insert empty line/scope before",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Inserts an empty line above the ${TARGET_DESC} without moving the cursor.`,
      },
      {
        command: `${VAR_SPOKEN_FORM} ${ITEM} ${TARGET}`,
        description: `Inserts the required delimiter before the collection item containing the ${TARGET_DESC}.`,
      },
    ],
  },
  insertEmptyLinesAround: {
    name: "Insert empty lines/scopes around",
    defaultSpokenForm: "puff",
    group: {
      id: "emptyLines",
      index: 4,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Insert empty lines/scopes around ${VAR_TARGET}.`,
        cheatsheet: "Insert empty lines/scopes around",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Inserts empty lines around the line containing the ${TARGET_DESC} without moving the cursor.`,
      },
      {
        command: `${VAR_SPOKEN_FORM} ${TOKEN} ${TARGET}`,
        description: `Inserts spaces around the ${TARGET_DESC}.`,
      },
    ],
  },
  joinLines: {
    name: "Join lines",
    defaultSpokenForm: "join",
    group: {
      id: "join",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Join lines at ${VAR_TARGET}.`,
        cheatsheet: "Join lines",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Joins the line containing the ${TARGET_DESC} with the following line.`,
      },
    ],
  },
  outdentLine: {
    name: "Outdent line",
    defaultSpokenForm: "dedent",
    group: {
      id: "indentation",
      index: 1,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Outdent line containing ${VAR_TARGET}.`,
        cheatsheet: "Outdent line",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Decreases the indentation of the line containing the ${TARGET_DESC}.`,
      },
    ],
  },
  randomizeTargets: {
    name: "Randomize targets",
    defaultSpokenForm: "shuffle",
    group: {
      id: "reorder",
      index: 1,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Randomize ${VAR_TARGET}s.`,
        cheatsheet: "Randomize targets",
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${EVERY} ${ITEM} ${TARGET}`,
        description: `Randomizes the collection items associated with the ${TARGET_DESC}.`,
      },
    ],
  },
  remove: {
    name: "Remove",
    defaultSpokenForm: REMOVE,
    group: {
      id: "change",
      index: 0,
    },
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
    group: {
      id: "rename",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Rename ${VAR_TARGET}.`,
        cheatsheet: "Rename",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Starts renaming the ${TARGET_DESC}.`,
      },
    ],
  },
  revealDefinition: {
    name: "Reveal definition",
    defaultSpokenForm: "define",
    group: {
      id: "navigation",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Reveal definition of ${VAR_TARGET}.`,
        cheatsheet: "Reveal definition",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Opens the definition of the ${TARGET_DESC}.`,
      },
    ],
  },
  revealTypeDefinition: {
    name: "Reveal type definition",
    defaultSpokenForm: "type deaf",
    group: {
      id: "navigation",
      index: 1,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Reveal type definition of ${VAR_TARGET}.`,
        cheatsheet: "Reveal type definition",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Opens the type definition of the ${TARGET_DESC}.`,
      },
    ],
  },
  reverseTargets: {
    name: "Reverse targets",
    defaultSpokenForm: "reverse",
    group: {
      id: "reorder",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Reverse ${VAR_TARGET}s.`,
        cheatsheet: "Reverse targets",
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${EVERY} ${ITEM} ${TARGET}`,
        description: `Reverses the collection items associated with the ${TARGET_DESC}.`,
      },
    ],
  },
  scrollToBottom: {
    name: "Scroll to bottom",
    defaultSpokenForm: "bottom",
    group: {
      id: "scroll",
      index: 2,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Scroll ${VAR_TARGET} to bottom of the viewport.`,
        cheatsheet: "Scroll to bottom",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Scrolls the ${TARGET_DESC} to the bottom of the viewport.`,
      },
    ],
  },
  scrollToCenter: {
    name: "Scroll to center",
    defaultSpokenForm: "center",
    group: {
      id: "scroll",
      index: 1,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Scroll ${VAR_TARGET} to center of the viewport.`,
        cheatsheet: "Scroll to center",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Scrolls the ${TARGET_DESC} to the center of the viewport.`,
      },
    ],
  },
  scrollToTop: {
    name: "Scroll to top",
    defaultSpokenForm: "crown",
    group: {
      id: "scroll",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Scroll ${VAR_TARGET} to top of the viewport.`,
        cheatsheet: "Scroll to top",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Scrolls the ${TARGET_DESC} to the top of the viewport.`,
      },
    ],
  },
  showDebugHover: {
    name: "Show debug hover",
    defaultSpokenForm: "inspect",
    group: {
      id: "navigation",
      index: 9,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Show debug hover for ${VAR_TARGET}.`,
        cheatsheet: "Show debug hover",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Shows debug information for the ${TARGET_DESC}.`,
      },
    ],
  },
  showHover: {
    name: "Show hover",
    defaultSpokenForm: "hover",
    group: {
      id: "navigation",
      index: 3,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Show hover for ${VAR_TARGET}.`,
        cheatsheet: "Show hover",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Shows hover information for the ${TARGET_DESC}.`,
      },
    ],
  },
  showQuickFix: {
    name: "Show quick fix",
    defaultSpokenForm: "quick fix",
    group: {
      id: "navigation",
      index: 4,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Show quick fix for ${VAR_TARGET}.`,
        cheatsheet: "Show quick fix",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Shows quick fixes for the ${TARGET_DESC}.`,
      },
    ],
  },
  showReferences: {
    name: "Show references",
    defaultSpokenForm: "reference",
    group: {
      id: "navigation",
      index: 2,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Show references for ${VAR_TARGET}.`,
        cheatsheet: "Show references",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Shows references to the ${TARGET_DESC}.`,
      },
    ],
  },
  sortTargets: {
    name: "Sort targets",
    defaultSpokenForm: "sort",
    group: {
      id: "reorder",
      index: 2,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Sort ${VAR_TARGET}s.`,
        cheatsheet: "Sort targets",
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${EVERY} ${ITEM} ${TARGET}`,
        description: `Sorts the collection items associated with the ${TARGET_DESC}.`,
      },
    ],
  },
  toggleLineBreakpoint: {
    name: "Toggle line/scope breakpoint",
    defaultSpokenForm: "break point",
    group: {
      id: "editor",
      index: 2,
    },
    description: "Scope defaults to line.",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Toggle breakpoint on line containing ${VAR_TARGET}.`,
        cheatsheet: "Toggle line breakpoint",
      },
      {
        pattern: `${VAR_SPOKEN_FORM} ${TOKEN} ${VAR_TARGET}`,
        description: `Toggle inline breakpoint at ${VAR_TARGET}.`,
        cheatsheet: "Toggle inline breakpoint",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Toggles a breakpoint on the line containing the ${TARGET_DESC}.`,
      },
      {
        command: `${VAR_SPOKEN_FORM} ${TOKEN} ${TARGET}`,
        description: `Toggles an inline breakpoint at the ${TARGET_DESC}.`,
      },
    ],
  },
  toggleLineComment: {
    name: "Toggle line comment",
    defaultSpokenForm: "comment",
    group: {
      id: "editor",
      index: 1,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Toggle line comment at ${VAR_TARGET}.`,
        cheatsheet: "Toggle line comment",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Toggles the comment on the line containing the ${TARGET_DESC}.`,
      },
    ],
  },
  unfoldRegion: {
    name: "Unfold region",
    defaultSpokenForm: "unfold",
    group: {
      id: "folding",
      index: 1,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Unfold region at ${VAR_TARGET}.`,
        cheatsheet: "Unfold region",
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${FUNCTION} ${TARGET}`,
        description: `Unfolds the function containing the ${TARGET_DESC}.`,
      },
    ],
  },
  callAsFunction: {
    name: "Call as function",
    defaultSpokenForm: "call",
    group: {
      id: "insert",
      index: 1,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Insert call to ${VAR_TARGET} on selection.`,
        cheatsheet: `Insert call to ${VAR_TARGET} on selection`,
      },
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_TARGET_1} ${ON} ${VAR_TARGET_2}`,
        description: `Insert call to ${VAR_TARGET_1} on ${VAR_TARGET_2}.`,
        cheatsheet: `Insert call to ${VAR_TARGET_1} on ${VAR_TARGET_2}`,
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Inserts a call to the ${TARGET_DESC} at the current selection.`,
      },
      {
        command: `${VAR_SPOKEN_FORM} ${TARGET} ${ON} ${TARGET_2}`,
        description: `Inserts a call to the ${TARGET_DESC} on the ${TARGET_2_DESC}.`,
      },
    ],
  },
  generateSnippet: {
    name: "Generate snippet",
    defaultSpokenForm: "snip make",
    group: {
      id: "snippets",
      index: 0,
    },
    legacySpokenForms: ["snippet make"],
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Generate snippet from ${VAR_TARGET}.`,
        cheatsheet: "Generate snippet",
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${FUNCTION} ${TARGET}`,
        description: `Generates a snippet from the function containing the ${TARGET_DESC}.`,
      },
    ],
  },
  highlight: {
    name: "Highlight",
    defaultSpokenForm: "highlight",
    group: {
      id: "visual",
      index: 1,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Highlight ${VAR_TARGET}.`,
        cheatsheet: "Highlight",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Highlights the ${TARGET_DESC}.`,
      },
    ],
  },
  insertSnippet: {
    name: "Insert snippet",
    defaultSpokenForm: "snip",
    group: {
      id: "snippets",
      index: 1,
    },
    syntaxes: [
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_SNIPPET} ${VAR_DESTINATION}`,
        description: `Insert snippet at ${VAR_DESTINATION}.`,
        cheatsheet: `Insert snippet at ${VAR_DESTINATION}`,
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${SNIPPET_IF} ${AFTER} ${TARGET}`,
        description: `Inserts an if-statement snippet after the ${TARGET_DESC}.`,
      },
    ],
  },
  moveToTarget: {
    name: "Move to target",
    defaultSpokenForm: "move",
    group: {
      id: "move",
      index: 0,
    },
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
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Moves the ${TARGET_DESC} to the current selection.`,
      },
      {
        command: `${VAR_SPOKEN_FORM} ${TARGET} ${AFTER} ${TARGET_2}`,
        description: `Moves the ${TARGET_DESC} to after the ${TARGET_2_DESC}.`,
      },
    ],
  },
  pasteFromClipboard: {
    name: "Paste from clipboard",
    defaultSpokenForm: "paste",
    group: {
      id: "clipboard",
      index: 2,
    },
    syntaxes: [
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_DESTINATION}`,
        description: `Paste from clipboard at ${VAR_DESTINATION}.`,
        cheatsheet: `Paste from clipboard at ${VAR_DESTINATION}`,
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${AFTER} ${TARGET}`,
        description: `Pastes the clipboard contents after the ${TARGET_DESC}.`,
      },
    ],
  },
  replaceWithTarget: {
    name: "Replace with target",
    defaultSpokenForm: "bring",
    group: {
      id: "insert",
      index: 0,
    },
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
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Inserts a copy of the ${TARGET_DESC} at the current selection.`,
      },
      {
        command: `${VAR_SPOKEN_FORM} ${TARGET} ${TO} ${TARGET_2}`,
        description: `Replaces the ${TARGET_2_DESC} with a copy of the ${TARGET_DESC}.`,
      },
    ],
  },
  rewrapWithPairedDelimiter: {
    name: "Rewrap with paired delimiter",
    defaultSpokenForm: "repack",
    group: {
      id: "wrap",
      index: 1,
    },
    syntaxes: [
      {
        pattern: `${VAR_PAIR} ${VAR_SPOKEN_FORM} ${VAR_TARGET}`,
        description: `Rewrap ${VAR_TARGET} with ${VAR_PAIR}.`,
        cheatsheet: `Rewrap ${VAR_TARGET} with ${VAR_PAIR}`,
      },
    ],
    examples: [
      {
        command: `${CURLY} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Replaces the paired delimiters around the ${TARGET_DESC} with curly brackets.`,
      },
    ],
  },
  swapTargets: {
    name: "Swap targets",
    defaultSpokenForm: "swap",
    group: {
      id: "swap",
      index: 0,
    },
    syntaxes: [
      {
        pattern: `${VAR_SPOKEN_FORM} ${WITH} ${VAR_TARGET}`,
        description: `Swap selection with ${VAR_TARGET}.`,
        cheatsheet: `Swap selection with ${VAR_TARGET}`,
      },
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_TARGET_1} ${WITH} ${VAR_TARGET_2}`,
        description: `Swap ${VAR_TARGET_1} with ${VAR_TARGET_2}.`,
        cheatsheet: `Swap ${VAR_TARGET_1} with ${VAR_TARGET_2}`,
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${WITH} ${TARGET}`,
        description: `Swaps the current selection with the ${TARGET_DESC}.`,
      },
      {
        command: `${VAR_SPOKEN_FORM} ${TARGET} ${WITH} ${TARGET_2}`,
        description: `Swaps the ${TARGET_DESC} and the ${TARGET_2_DESC}.`,
      },
    ],
  },
  wrapWithPairedDelimiter: {
    name: "Wrap with paired delimiter",
    defaultSpokenForm: "wrap",
    group: {
      id: "wrap",
      index: 0,
    },
    syntaxes: [
      {
        pattern: `${VAR_PAIR} ${VAR_SPOKEN_FORM} ${VAR_TARGET}`,
        description: `Wrap ${VAR_TARGET} with ${VAR_PAIR}.`,
        cheatsheet: `Wrap ${VAR_TARGET} with ${VAR_PAIR}`,
      },
    ],
    examples: [
      {
        command: `${SQUARE} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Wraps the ${TARGET_DESC} in square brackets.`,
      },
    ],
  },
  wrapWithSnippet: {
    name: "Wrap with snippet",
    defaultSpokenForm: "wrap",
    group: {
      id: "snippets",
      index: 2,
    },
    syntaxes: [
      {
        pattern: `${VAR_SNIPPET} ${VAR_SPOKEN_FORM} ${VAR_TARGET}`,
        description: `Wrap ${VAR_TARGET} with ${VAR_SNIPPET}.`,
        cheatsheet: `Wrap ${VAR_TARGET} with ${VAR_SNIPPET}`,
      },
    ],
    examples: [
      {
        command: `${SNIPPET_IF} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Wraps the ${TARGET_DESC} in an if-statement snippet.`,
      },
    ],
  },
  applyFormatter: {
    name: "Apply formatter",
    defaultSpokenForm: "format",
    group: {
      id: "editor",
      index: 0,
    },
    syntaxes: [
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_FORMATTER} ${AT} ${VAR_TARGET}`,
        description: `Reformat ${VAR_TARGET} as ${VAR_FORMATTER}.`,
        cheatsheet: `Reformat ${VAR_TARGET} as ${VAR_FORMATTER}`,
      },
    ],
    examples: [
      {
        command: `${VAR_SPOKEN_FORM} ${FORMATTER_CAMEL} ${AT} ${TARGET}`,
        description: `Reformats the ${TARGET_DESC} as camel case.`,
      },
    ],
  },
  nextHomophone: {
    name: "Next homophone",
    defaultSpokenForm: "phones",
    group: {
      id: "homophones",
      index: 0,
    },
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Cycle to next homophone for ${VAR_TARGET}.`,
        cheatsheet: "Cycle to next homophone",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Replaces the ${TARGET_DESC} with its next homophone.`,
      },
    ],
  },

  // Private actions --------------------

  "private.showParseTree": {
    name: "Show parse tree",
    defaultSpokenForm: "parse tree",
    group: {
      id: "private",
      index: 0,
    },
    private: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: `Show parse tree for ${VAR_TARGET}.`,
        cheatsheet: "Show parse tree",
      },
    ],
    examples: [
      {
        command: DEFAULT_COMMAND,
        description: `Shows the parse tree for the ${TARGET_DESC}.`,
      },
    ],
  },
  parsed: {
    name: "Parsed",
    defaultSpokenForm: "parsed",
    private: true,
    group: {
      id: "private",
      index: 1,
    },
    syntaxes: [],
    examples: [],
  },
  "private.getTargets": {
    name: "Get targets",
    defaultSpokenForm: "get targets",
    group: {
      id: "private",
      index: 2,
    },
    private: true,
    syntaxes: [],
    examples: [],
  },
  "private.setKeyboardTarget": {
    name: "Set keyboard target",
    defaultSpokenForm: "set keyboard target",
    group: {
      id: "private",
      index: 3,
    },
    private: true,
    syntaxes: [],
    examples: [],
  },
  executeCommand: {
    name: "Execute command",
    defaultSpokenForm: "execute command",
    group: {
      id: "private",
      index: 4,
    },
    private: true,
    syntaxes: [],
    examples: [],
  },
  editNew: {
    name: "Edit new",
    defaultSpokenForm: "edit new",
    group: {
      id: "private",
      index: 5,
    },
    private: true,
    syntaxes: [],
    examples: [],
  },
  getText: {
    name: "Get text",
    defaultSpokenForm: "get text",
    group: {
      id: "private",
      index: 6,
    },
    private: true,
    syntaxes: [],
    examples: [],
  },
  replace: {
    name: "Replace",
    defaultSpokenForm: "replace",
    group: {
      id: "private",
      index: 7,
    },
    private: true,
    syntaxes: [],
    examples: [],
  },
} as const satisfies Record<
  ActionType | TalonSideActionType,
  ActionReferenceEntry
>;
