import type { ReferenceGroup } from "./ReferenceEntry";

export type ActionReferenceGroupId =
  | "cursor"
  | "change"
  | "clone"
  | "clipboard"
  | "swap"
  | "indentation"
  | "numbers"
  | "emptyLines"
  | "homophones"
  | "rename"
  | "scroll"
  | "insert"
  | "move"
  | "reorder"
  | "wrap"
  | "navigation"
  | "folding"
  | "extract"
  | "join"
  | "break"
  | "visual"
  | "snippets"
  | "git"
  | "editor"
  | "targetContext"
  | "private";

export const actionReferenceGroups: ReferenceGroup<ActionReferenceGroupId>[] = [
  {
    id: "cursor",
    name: "Cursor movement",
  },
  {
    id: "change",
    name: "Changing a target",
  },
  {
    id: "clone",
    name: "Clone",
  },
  {
    id: "clipboard",
    name: "Cut, copy, and paste",
  },
  {
    id: "swap",
    name: "Swap",
  },
  {
    id: "indentation",
    name: "Indent and outdent",
  },
  {
    id: "numbers",
    name: "Increment and decrement",
  },
  {
    id: "emptyLines",
    name: "Insert empty lines or scopes",
  },
  {
    id: "homophones",
    name: "Homophones",
  },
  {
    id: "rename",
    name: "Rename",
  },
  {
    id: "scroll",
    name: "Scroll",
  },
  {
    id: "insert",
    name: "Insert, use, and repeat",
  },
  {
    id: "move",
    name: "Move and replace",
  },
  {
    id: "reorder",
    name: "Reverse, shuffle, and sort",
  },
  {
    id: "wrap",
    name: "Wrap and rewrap",
  },
  {
    id: "navigation",
    name: "Navigate and inspect",
  },
  {
    id: "folding",
    name: "Fold and unfold",
  },
  {
    id: "extract",
    name: "Extract",
  },
  {
    id: "join",
    name: "Join",
  },
  {
    id: "break",
    name: "Break",
  },
  {
    id: "visual",
    name: "Visual feedback",
  },
  {
    id: "snippets",
    name: "Snippets",
  },
  {
    id: "git",
    name: "Git",
  },
  {
    id: "editor",
    name: "Editor commands",
  },
  {
    id: "targetContext",
    name: "Target context",
  },
];
