import type { IDE } from "@cursorless/lib-common";
import { showError } from "@cursorless/lib-common";
import type { Query } from "web-tree-sitter";
import { parsePredicates } from "./parsePredicates";
import { predicateToString } from "./predicateToString";
import type { PatternPredicate } from "./QueryCapture";

export function parsePredicatesWithErrorHandling(
  ide: IDE,
  languageId: string,
  query: Query,
): PatternPredicate[][] {
  const { errors, predicates } = parsePredicates(query.predicates);

  if (errors.length > 0) {
    for (const error of errors) {
      const context = [
        `language ${languageId}`,
        `pattern ${error.patternIdx}`,
        `predicate \`${predicateToString(
          query.predicates[error.patternIdx][error.predicateIdx],
        )}\``,
      ].join(", ");

      void showError(
        ide.messages,
        "TreeSitterQuery.parsePredicates",
        `Error parsing predicate for ${context}: ${error.error}`,
      );
    }

    // We show errors to the user, but we don't want to crash the extension
    // unless we're in test mode
    if (ide.runMode === "test") {
      throw new Error("Invalid predicates");
    }
  }

  return predicates;
}
