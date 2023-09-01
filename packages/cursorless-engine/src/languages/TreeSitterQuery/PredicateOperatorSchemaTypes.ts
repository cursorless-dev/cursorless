import type z from "zod";
import type {
  SchemaInputType,
  SchemaOutputType,
} from "./operatorArgumentSchemaTypes";
import type { MutableQueryCapture } from "./QueryCapture";

/**
 * A schema used to validate a list of operands for a given predicate operator.
 * The input will be the operands as returned directly from tree-sitter when it
 * parses the query file.  The output is an intermediate representation of the
 * operands, where we've converted numbers etc, but we haven't yet converted
 * captures to nodes, because that will be done dynamically each time we run a
 * query.
 */
type OperandListSchemaType = z.ZodType<
  SchemaOutputType[],
  z.ZodTypeDef,
  SchemaInputType[]
>;

// These two types are used to allow us to infer the schema type from the
// operator type.  For example, if we have a type `NotType` that extends
// `QueryPredicateOperator<NotType>`, we can infer the schema type from the
// `schema` property of `NotType`.
export interface HasSchema {
  schema: OperandListSchemaType;
}
export type InferSchemaType<T extends HasSchema> = T["schema"];

/**
 * Maps from an operand schema output type to the type of the argument that
 * will be passed to the `accept` function of the predicate operator.  For example:
 *
 * - `{type: "capture", name: string}` -> `SyntaxNode`
 * - `{type: "integer", value: number}` -> `number`
 */
type PredicateParameterType<T extends SchemaOutputType> = T extends {
  type: "capture";
}
  ? MutableQueryCapture
  : T extends { value: infer V }
  ? V
  : never;

// These two types work together to convert a list of operands from the type
// output by our schema validator to the type that will be passed to the `accept`
// function of the predicate operator.
type PredicateParameterListType<T extends SchemaOutputType[]> = {
  [I in keyof T]: PredicateParameterType<T[I]>;
};
export type AcceptFunctionArgs<T extends SchemaOutputType[]> = T extends [
  ...args: infer U extends SchemaOutputType[],
]
  ? [...args: PredicateParameterListType<U>]
  : never;
