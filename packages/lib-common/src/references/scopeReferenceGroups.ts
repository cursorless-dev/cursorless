import type { ReferenceGroup } from "./ReferenceEntry";

export type ScopeReferenceGroupId =
  | "text"
  | "documentHierarchy"
  | "collections"
  | "functions"
  | "objects"
  | "statements"
  | "markup"
  | "sections"
  | "notebook"
  | "private";

export const scopeReferenceGroups: ReferenceGroup<ScopeReferenceGroupId>[] = [
  {
    id: "text",
    name: "Text-based scopes",
  },
  {
    id: "documentHierarchy",
    name: "Document hierarchy",
  },
  {
    id: "collections",
    name: "Collections",
  },
  {
    id: "functions",
    name: "Functions and calls",
  },
  {
    id: "objects",
    name: "Classes and objects",
  },
  {
    id: "statements",
    name: "Statements and expressions",
  },
  {
    id: "markup",
    name: "Markup and styles",
  },
  {
    id: "sections",
    name: "Sections",
  },
  {
    id: "notebook",
    name: "Notebook",
  },
];
