import type { Range, TextEditor } from "@cursorless/common";
import { map } from "itertools";
import type { ScopeRanges } from "..";
import type { ScopeHandler } from "../processTargets/modifiers/scopeHandlers/scopeHandler.types";
import { getTargetRanges } from "./getTargetRanges";

/**
 * Returns a list of scope ranges of type {@link scopeHandler} within
 * {@link iterationRange} in {@link editor}.
 * @param editor The editor to check
 * @param scopeHandler The scope handler to use
 * @param iterationRange The range to iterate over
 * @returns A list of scope ranges for the given editor
 */
export function getScopeRanges(
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
      domain: scope.domain,
      targets: scope.getTargets(false).map(getTargetRanges),
    }),
  );
}
