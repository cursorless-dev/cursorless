import type { ReferenceGroup } from "./ReferenceEntry";

export type ModifierReferenceGroupId =
  | "position"
  | "delimiters"
  | "scope"
  | "range"
  | "filters"
  | "inference"
  | "private";

export const modifierReferenceGroups: ReferenceGroup<ModifierReferenceGroupId>[] =
  [
    {
      id: "position",
      name: "Positions",
    },
    {
      id: "delimiters",
      name: "Interiors and delimiters",
    },
    {
      id: "scope",
      name: "Scope navigation",
    },
    {
      id: "range",
      name: "Range extension",
    },
    {
      id: "filters",
      name: "Filters",
    },
    {
      id: "inference",
      name: "Inference",
    },
  ];
