import {
  type Range,
  type SurroundingPairName,
  type TextEditor,
  Position,
} from "@cursorless/common";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";

export function getInteriorRanges(
  scopeHandlerFactory: ScopeHandlerFactory,
  languageId: string,
  editor: TextEditor,
  delimiter: SurroundingPairName,
): { range: Range }[] {
  const scopeHandler = scopeHandlerFactory.create(
    {
      type: "surroundingPairInterior",
      delimiter,
    },
    languageId,
  );

  return Array.from(
    scopeHandler.generateScopes(editor, new Position(0, 0), "forward", {
      containment: undefined,
      skipAncestorScopes: false,
      includeDescendantScopes: true,
    }),
    (scope) => ({ range: scope.domain }),
  );
}
