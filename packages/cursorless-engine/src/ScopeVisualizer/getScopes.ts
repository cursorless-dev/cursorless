import {
  Range,
  ScopeRanges,
  TextEditor,
  toCharacterRange,
} from "@cursorless/common";
import { map } from "itertools";
import { ScopeHandler } from "../processTargets/modifiers/scopeHandlers/scopeHandler.types";
import { getTargetRanges } from "./getTargetRanges";

export function getScopes(
  editor: TextEditor,
  scopeHandler: ScopeHandler,
  iterationRange: Range,
): ScopeRanges[] {
  return map(
    scopeHandler.generateScopes(editor, iterationRange.start, "forward", {
      includeDescendantScopes: true,
      distalPosition: iterationRange.end,
    }),
    (scope) => ({
      domain: toCharacterRange(scope.domain),
      targets: scope.getTargets(false).map(getTargetRanges),
    }),
  );
}
