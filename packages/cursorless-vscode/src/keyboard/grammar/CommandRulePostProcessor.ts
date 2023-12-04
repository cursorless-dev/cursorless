import {
  KeyboardCommand,
  KeyboardCommandArgTypes,
} from "../KeyboardCommandTypeHelpers";
import { Unused } from "./grammarHelpers";

/**
 * Represents a post-processing function for a top-level rule of our grammar.
 * This is a function that takes the output of a rule and transforms it into a
 * command usable by our command handler. We also keep metadata about the rule
 * on the postprocess function so that we can display it to the user, eg in the
 * sidebar. The reason we keep the metadata here is that the postprocess
 * function is the only thing we have control over in the nearley parser.
 */
export interface CommandRulePostProcessor<
  T extends keyof KeyboardCommandArgTypes = keyof KeyboardCommandArgTypes,
> {
  (args: any[]): KeyboardCommand<T>;
  metadata: {
    /** The command type */
    type: T;
    /** The names of the arguments to the command's argument payload */
    argNames: (keyof KeyboardCommandArgTypes[T] | Unused)[];
  };
}
