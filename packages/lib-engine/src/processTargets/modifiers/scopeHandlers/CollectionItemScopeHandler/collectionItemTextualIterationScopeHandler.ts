import { testRegex } from "@cursorless/lib-common";
import type { FallbackScopeType } from "../scopeHandler.types";
import { separatorRegex } from "./getSeparatorOccurrences";

export const collectionItemTextualIterationScopeHandler: FallbackScopeType = {
  type: "fallback",
  scopeTypes: [
    {
      type: "conditional",
      scopeType: {
        type: "surroundingPairInterior",
        delimiter: "collectionBoundary",
      },
      predicate: (scope) => !scope.domain.isEmpty,
    },
    {
      type: "conditional",
      scopeType: {
        type: "line",
      },
      predicate: (scope) => {
        const text = scope.editor.document.getText(scope.domain);
        return testRegex(separatorRegex, text);
      },
    },
  ],
};
