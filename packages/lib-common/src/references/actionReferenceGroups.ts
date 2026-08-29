import type { ActionReferenceGroup } from "./ReferenceEntry";

export const actionReferenceGroups: ActionReferenceGroup[] = [
  {
    id: "cursor",
    name: "Cursor movement",
    description: [
      "Despite the name Cursorless, some of the most basic commands in Cursorless are for moving the cursor.",
      "",
      "Note that when combined with list targets, `take`/`pre`/`post` commands will result in multiple cursors.",
    ],
  },
  {
    id: "change",
    name: "Changing a target",
    description: [
      "Actions that delete or change a target's text while keeping the cursor in a useful location.",
    ],
  },
  {
    id: "clone",
    name: "Clone",
    description: [
      "Insert a copy of a target before or after itself and select the newly created copy.",
    ],
  },
  {
    id: "clipboard",
    name: "Cut, copy, and paste",
    description: ["Transfer targets using the system clipboard."],
  },
  {
    id: "swap",
    name: "Swap",
    description: [
      "Swap two targets. If each side contains multiple targets, the targets are zipped together and swapped pairwise.",
    ],
  },
  {
    id: "indentation",
    name: "Indent and outdent",
    description: ["Increase or decrease the indentation of a target."],
  },
  {
    id: "numbers",
    name: "Increment and decrement",
    description: ["Increase or decrease a number target."],
  },
  {
    id: "emptyLines",
    name: "Insert empty lines or scopes",
    description: [
      "Insert editable space before, after, or around a target.",
      "",
      "With a syntactic scope target, these actions insert the appropriate delimiters for a new instance of that scope.",
    ],
  },
  {
    id: "homophones",
    name: "Homophones",
    description: ["Cycle a target through its homophones."],
  },
  {
    id: "rename",
    name: "Rename",
    description: ["Use the editor's rename operation on a target."],
  },
  {
    id: "scroll",
    name: "Scroll",
    description: [
      "Scroll a target to the top, center, or bottom of the viewport.",
    ],
  },
  {
    id: "insert",
    name: "Insert, use, and repeat",
    description: [
      "Insert or use the contents of one target at the current selection or another destination.",
    ],
  },
  {
    id: "move",
    name: "Move and replace",
    description: [
      "Move a target to the current selection or another destination.",
    ],
  },
  {
    id: "reorder",
    name: "Reverse, shuffle, and sort",
    description: ["Change the order of multiple targets or selections."],
  },
  {
    id: "wrap",
    name: "Wrap and rewrap",
    description: [
      "Wrap a target with paired delimiters, or replace its existing delimiters.",
    ],
  },
  {
    id: "navigation",
    name: "Navigate and inspect",
    description: [
      "Navigate to related code, search for a target, or show editor information and available fixes.",
    ],
  },
  {
    id: "folding",
    name: "Fold and unfold",
    description: ["Fold or unfold the region containing a target."],
  },
  {
    id: "extract",
    name: "Extract",
    description: [
      "Extract a target into a variable using the editor's refactor action.",
    ],
  },
  {
    id: "join",
    name: "Join",
    description: ["Join multiple lines into one line."],
  },
  {
    id: "break",
    name: "Break",
    description: ["Break a line in two before a target."],
  },
  {
    id: "visual",
    name: "Visual feedback",
    description: ["Temporarily identify or persistently highlight targets."],
  },
  {
    id: "snippets",
    name: "Snippets",
    description: ["Generate, insert, or wrap targets with snippets."],
  },
  {
    id: "git",
    name: "Git",
    description: ["Accept, revert, stage, or unstage Git changes."],
  },
  {
    id: "editor",
    name: "Editor commands",
    description: [
      "Run editor operations such as formatting, commenting, and toggling breakpoints.",
    ],
  },
  {
    id: "targetContext",
    name: "Target context",
    description: [
      "Set contextual references that can be used to resolve later targets.",
    ],
  },
];
