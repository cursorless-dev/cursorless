import { testRegex } from "@cursorless/common";
import type { TargetScope } from "../scope.types";
import type { ComplexScopeType } from "../scopeHandler.types";
import { separatorRegex } from "./getSeparatorOccurrences";

export const collectionItemIterationScopeHandler: ComplexScopeType = {
  type: "fallback",
  scopeTypes: [
    {
      type: "surroundingPairInterior",
      delimiter: "collectionBoundary",
    },
    {
      type: "conditional",
      scopeType: {
        type: "line",
      },
      predicate: (scope: TargetScope) => {
        const text = scope.editor.document.getText(scope.domain);
        return testRegex(separatorRegex, text);
      },
    },
  ],
};
