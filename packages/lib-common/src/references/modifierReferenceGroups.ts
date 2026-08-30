import type { ReferenceGroup } from "./ReferenceEntry";

export type ModifierReferenceGroupId =
  | "position"
  | "delimiters"
  | "containing"
  | "ordinal"
  | "relative"
  | "range"
  | "filters"
  | "inference"
  | "private";

export const modifierReferenceGroups: ReferenceGroup<ModifierReferenceGroupId>[] =
  [
    {
      id: "containing",
      name: "Scope containment",
    },
    {
      id: "ordinal",
      name: "Ordinal scope",
    },
    {
      id: "relative",
      name: "Relative scope",
    },
    {
      id: "delimiters",
      name: "Interiors / delimiters",
    },
    {
      id: "range",
      name: "Range extension",
    },
    {
      id: "position",
      name: "Positions",
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
