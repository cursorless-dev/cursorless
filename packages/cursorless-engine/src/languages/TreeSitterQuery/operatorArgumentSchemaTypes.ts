import z from "zod";
import { assertTypesEqual } from "./assertTypesEqual";
import { PredicateOperand } from "web-tree-sitter";

const string = z.object({ type: z.literal("string"), value: z.string() });

/**
 * Contains schema types to be used for defining operator argument schemas.
 */
export const q = {
  /**
   * Expect a capture, eg @foo.  The operator will receive the node referenced
   * by the capture
   */
  node: z.object({ type: z.literal("capture"), name: z.string() }),

  /** Expect a string */
  string,

  /** Expect an integer */
  integer: string.transform((val, ctx) => {
    const parsedValue = parseInt(val.value);

    if (isNaN(parsedValue)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expected an integer",
      });

      // This is a special symbol you can use to
      // return early from the transform function.
      // It has type `never` so it does not affect the
      // inferred return type.
      return z.NEVER;
    }
    return { type: "integer", value: parsedValue } as const;
  }),
} as const;

export type SchemaTypes = (typeof q)[keyof typeof q];

/**
 * The type of the input to the schema.  This should always be
 * `PredicateOperand`, as that is what we always get from tree-sitter
 */
export type SchemaInputType = PredicateOperand;
assertTypesEqual<SchemaInputType, z.input<SchemaTypes>, SchemaInputType>;

/**
 * The type of the output of the schema.  This is the intermediate operand
 * representation where we've converted numbers etc, but we haven't yet
 * converted captures to nodes, because that will be done dynamically each time
 * we run a query.
 */
export type SchemaOutputType = z.output<SchemaTypes>;
