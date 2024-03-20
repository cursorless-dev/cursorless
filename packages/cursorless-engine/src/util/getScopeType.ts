import type { Modifier, ScopeType } from "@cursorless/common";

export function getScopeType(modifier: Modifier): ScopeType | undefined {
  switch (modifier.type) {
    case "containingScope":
    case "everyScope":
    case "ordinalScope":
    case "relativeScope":
      return modifier.scopeType;

    case "interiorOnly":
    case "excludeInterior":
    case "visible":
    case "toRawSelection":
    case "inferPreviousMark":
    case "keepContentFilter":
    case "keepEmptyFilter":
    case "leading":
    case "trailing":
    case "startOf":
    case "endOf":
    case "extendThroughStartOf":
    case "extendThroughEndOf":
    case "cascading":
    case "range":
    case "modifyIfUntyped":
      return undefined;

    default: {
      const _exhaustiveCheck: never = modifier;
    }
  }
}
