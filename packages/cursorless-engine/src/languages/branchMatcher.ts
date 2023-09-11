import { NodeMatcher } from "../typings/Types";
import { patternFinder } from "../util/nodeFinders";
import {
  cascadingMatcher,
  matcher,
  patternMatcher,
} from "../util/nodeMatchers";
import { childRangeSelector } from "../util/nodeSelectors";

/**
 * Constructs a branch matcher for constructs that have a primary branch
 * followed by zero or more optional branches, such as `if` statements or `try`
 * statements
 * @param statementType The top-level statement type for this construct, eg
 * "if_statement" or "try_statement"
 * @param optionalBranchTypes The optional branch type names that can be
 * children of the top-level statement, eg "else_clause" or "except_clause"
 * @returns A node matcher capable of matching this type of branch
 */
export function branchMatcher(
  statementType: string,
  optionalBranchTypes: string[],
): NodeMatcher {
  return cascadingMatcher(
    patternMatcher(...optionalBranchTypes),
    matcher(
      patternFinder(statementType),
      childRangeSelector(optionalBranchTypes, [], {
        includeUnnamedChildren: true,
      }),
    ),
  );
}
