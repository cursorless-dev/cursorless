import type { ReferenceGroup } from "./ReferenceEntry";

export type ActionReferenceGroupId =
  | "cursor"
  | "change"
  | "clipboard"
  | "swap"
  | "indentation"
  | "numbers"
  | "emptyLines"
  | "homophones"
  | "scroll"
  | "insert"
  | "move"
  | "reorder"
  | "wrap"
  | "navigation"
  | "folding"
  | "refactor"
  | "joinBreak"
  | "visual"
  | "snippets"
  | "git"
  | "format"
  | "comment"
  | "breakpoint"
  | "instanceReference"
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
    id: "clipboard",
    name: "Cut / copy / paste",
  },
  {
    id: "insert",
    name: "Insert / use / repeat",
  },
  {
    id: "swap",
    name: "Swap",
  },
  {
    id: "move",
    name: "Move / replace",
  },
  {
    id: "indentation",
    name: "Indent / outdent",
  },
  {
    id: "emptyLines",
    name: "Insert empty lines / scopes",
  },
  {
    id: "reorder",
    name: "Reverse / shuffle / sort",
  },
  {
    id: "wrap",
    name: "Wrap / rewrap",
  },
  {
    id: "numbers",
    name: "Increment / decrement",
  },
  {
    id: "refactor",
    name: "Refactor / fix",
  },
  {
    id: "joinBreak",
    name: "Join / break",
  },
  {
    id: "snippets",
    name: "Snippets",
  },
  {
    id: "scroll",
    name: "Scroll",
  },
  {
    id: "folding",
    name: "Fold / unfold",
  },
  {
    id: "homophones",
    name: "Homophones",
  },
  {
    id: "format",
    name: "Format",
  },
  {
    id: "instanceReference",
    name: "Instance reference",
  },
  {
    id: "comment",
    name: "Comment",
  },
  {
    id: "breakpoint",
    name: "Breakpoint",
  },
  {
    id: "navigation",
    name: "Navigate / inspect",
  },
  {
    id: "git",
    name: "Git",
  },
  {
    id: "visual",
    name: "Visual feedback",
  },
];
