import { Range, ScopeRanges, TextEditor } from "@cursorless/common";
import { map } from "itertools";

import { ScopeHandler } from "../processTargets/modifiers/scopeHandlers/scopeHandler.types";
import { getTargetRanges } from "./getTargetRanges";

/**
 * Returns a list of scope ranges of type {@link scopeHandler} within
 * {@link iterationRange} in {@link editor}.
 * @param editor The editor to check
 * @param scopeHandler The scope handler to use
 * @param iterationRange The range to iterate over
 * @returns A list of scope ranges for the given editor
 */
export async function getScopeRanges(
  editor: TextEditor,
  scopeHandler: ScopeHandler,
  iterationRange: Range,
): Promise<ScopeRanges[]> {
  return await Promise.all(
    map(
      scopeHandler.generateScopes(editor, iterationRange.start, "forward", {
        includeDescendantScopes: true,
        distalPosition: iterationRange.end,
      }),
      async (scope) => ({
        domain: scope.domain,
        targets: await Promise.all(
          scope.getTargets(false).map(getTargetRanges),
        ),
      }),
    ),
  );
}
