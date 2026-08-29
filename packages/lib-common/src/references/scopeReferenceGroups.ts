import type { ReferenceGroup } from "./ReferenceEntry";

export type ScopeReferenceGroupId =
  | "tokens"
  | "text"
  | "functions"
  | "objects"
  | "collections"
  | "statements"
  | "markup"
  | "documentStructure"
  | "delimiters"
  | "private";

export const scopeReferenceGroups: ReferenceGroup<ScopeReferenceGroupId>[] = [
  {
    id: "tokens",
    name: "Characters and tokens",
  },
  {
    id: "text",
    name: "Lines and documents",
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
    id: "collections",
    name: "Collections",
  },
  {
    id: "statements",
    name: "Statements and expressions",
  },
  {
    id: "markup",
    name: "Markup",
  },
  {
    id: "documentStructure",
    name: "Document structure",
  },
  {
    id: "delimiters",
    name: "Paired delimiters",
  },
];
