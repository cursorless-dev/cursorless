import {
  type SurroundingPairName,
  type TextEditor,
  Position,
} from "@cursorless/common";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";
import { RangeIterator } from "./RangeIterator";

export function getInteriorRanges(
  scopeHandlerFactory: ScopeHandlerFactory,
  languageId: string,
  editor: TextEditor,
  delimiter: SurroundingPairName,
): RangeIterator {
  const scopeHandler = scopeHandlerFactory.create(
    {
      type: "surroundingPairInterior",
      delimiter,
    },
    languageId,
  );

  const ranges = Array.from(
    scopeHandler.generateScopes(editor, new Position(0, 0), "forward", {
      containment: undefined,
      skipAncestorScopes: false,
      includeDescendantScopes: true,
    }),
    (scope) => scope.domain,
  );

  return new RangeIterator(ranges);
}
