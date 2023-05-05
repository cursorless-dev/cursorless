import { PredicateOperand, QueryMatch } from "web-tree-sitter";
import z from "zod";
import {
  AcceptFunctionArgs,
  HasSchema,
  InferSchemaType,
} from "./PredicateOperatorSchemaTypes";
import { constructZodErrorMessages } from "./constructZodErrorMessages";

/**
 * An operator used in a query predicate, e.g. `not-type?`.  Note that the generic
 * type parameter `T` should always be the operator itself, e.g.
 *
 * ```ts
 * class NotType extends QueryPredicateOperator<NotType> {
 *    ...
 * }
 * ```
 *
 * This allows us to automatically infer the argument list type for the
 * `accept` function from the `schema` property of the operator.
 */
export abstract class QueryPredicateOperator<T extends HasSchema> {
  /**
   * The name of the operator, e.g. `not-type?`
   */
  abstract readonly name: `${string}?`;

  /**
   * The schema used to validate the operands to the operator.  This should be a
   * tuple of schemas from {@link q}, one for each operand.  For example, if the
   * operator takes a node and a string, the schema would be `z.tuple([q.node,
   * q.string])`.
   */
  abstract readonly schema: InferSchemaType<T>;

  /**
   * Given a list of operands, return whether the operator accepts the given
   * operands.  This is where the actual logic of the operator is implemented.
   *
   * @param args The arguments to the operator, converted to the types specified
   * in the schema.  For example, if the schema is `z.tuple([q.node, q.string])`,
   * then `args` will be `SyntaxNode, string`.
   */
  protected abstract accept(
    ...args: AcceptFunctionArgs<z.infer<InferSchemaType<T>>>
  ): boolean;

  /**
   * Given a list of operands, return a predicate function that can be used to
   * test whether a given match satisfies the predicate.
   *
   * @param inputOperands The operands to the operator, as returned directly
   * from tree-sitter when parse the query file.
   * @returns Either a predicate function, or a list of error messages if the operands
   * were invalid.
   */
  createPredicate(inputOperands: PredicateOperand[]): PredicateResult {
    const result = this.schema.safeParse(inputOperands);

    return result.success
      ? {
          success: true,
          predicate: (match: QueryMatch) =>
            this.accept(...this.constructAcceptArgs(result.data, match)),
        }
      : {
          success: false,
          errors: constructZodErrorMessages(inputOperands, result.error),
        };
  }

  /**
   * Given the output of the schema and a match, construct the arguments to pass
   * to the `accept` function.
   * @param rawOutput The output of the schema.
   * @param match The match to use to convert captures to nodes.
   * @returns The arguments to pass to the `accept` function.
   */
  private constructAcceptArgs(
    rawOutput: z.output<InferSchemaType<T>>,
    match: QueryMatch,
  ): AcceptFunctionArgs<z.infer<InferSchemaType<T>>> {
    return rawOutput.map((operand) => {
      if (operand.type === "capture") {
        const node = match.captures.find(
          (capture) => capture.name === operand.name,
        )?.node;

        if (node == null) {
          // FIXME: We could allow some predicates to be forgiving,
          // because it's possible to have a capture on an optional node.
          // In that case we'd prob just return `true` if any capture was
          // `null`, but we should check that the given capture name
          // appears statically in the given pattern.  But we don't yet
          // have a use case so let's leave it for now.
          throw new Error(`Could not find capture ${operand.name}`);
        }

        return node;
      } else {
        return operand.value;
      }
    }) as AcceptFunctionArgs<z.infer<InferSchemaType<T>>>;
  }
}

interface SuccessfulPredicateResult {
  success: true;
  predicate: (match: QueryMatch) => boolean;
}

interface FailedPredicateResult {
  success: false;
  errors: string[];
}

type PredicateResult = SuccessfulPredicateResult | FailedPredicateResult;
