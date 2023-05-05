import { PredicateResult, QueryMatch } from "web-tree-sitter";
import { queryPredicateOperators } from "./queryPredicateOperators";

/**
 * Parse a list of predicate descriptors per pattern into a list of predicate
 * functions per pattern.
 *
 * @param predicateDescriptors The predicate descriptors to parse.  Each entry
 * in the outer array corresponds to a pattern, and each entry in the inner
 * array corresponds to a predicate for that pattern.
 * @returns A list of errors, and a list of predicates.  The predicate list is
 * structured the same as the input, but each predicate in the inner list is a
 * function that takes a match and returns true if the match matches the
 * predicate.
 */
export function parsePredicates(predicateDescriptors: PredicateResult[][]) {
  const errors: PredicateError[] = [];
  const predicates: ((match: QueryMatch) => boolean)[][] = [];

  predicateDescriptors.forEach((patternPredicateDescriptors, patternIdx) => {
    /** The predicates for a given pattern */
    const patternPredicates: ((match: QueryMatch) => boolean)[] = [];

    patternPredicateDescriptors.forEach((predicateDescriptor, predicateIdx) => {
      const operator = queryPredicateOperators.find(
        ({ name }) => name === predicateDescriptor.operator,
      );

      if (operator == null) {
        errors.push({
          patternIdx,
          predicateIdx,
          error: `Unknown predicate operator "${predicateDescriptor.operator}"`,
        });
        return;
      }

      const result = operator.createPredicate(predicateDescriptor.operands);

      if (!result.success) {
        errors.push(
          ...result.errors.map((error) => ({
            patternIdx,
            predicateIdx,
            error,
          })),
        );
        return;
      }

      patternPredicates.push(result.predicate);
    });

    predicates.push(patternPredicates);
  });

  return { errors, predicates };
}

interface PredicateError {
  patternIdx: number;
  predicateIdx: number;
  error: string;
}
