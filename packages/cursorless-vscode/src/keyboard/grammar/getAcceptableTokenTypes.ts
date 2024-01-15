import nearley, { State } from "nearley";
import { isEqual } from "lodash";
import { CommandRulePostProcessor } from "./CommandRulePostProcessor";
import { UniqueWorkQueue } from "./UniqueWorkQueue";
import { uniqWithHash } from "@cursorless/common";
import { KeyboardCommandHandler } from "../KeyboardCommandHandler";

/**
 * Given a parser, returns a list of acceptable token types at the current state
 * of the parser. We use this to display a list of possible next tokens to the
 * user. We include information about which top-level rules want each token type
 * so that we can display the command name in the list. We also include a partial
 * argument for the command that wants the token type, which we could use to
 * provide even more information to the user.
 *
 * @param parser The parser to get the acceptable token types of
 * @returns A list of acceptable token types, along with information about which
 * top-level rules want them
 */
export function getAcceptableTokenTypes(parser: nearley.Parser) {
  return uniqWithHash(
    parser.table[parser.table.length - 1].scannable.flatMap(
      (scannableState) => {
        /** The token type */
        const { type } = scannableState.rule.symbols[scannableState.dot];

        return getRootStates(scannableState).map((root) => ({
          type,
          command: getMetadata(root).type,
          partialArg: computePartialArg(root),
        }));
      },
    ),
    isEqual,
    ({ type, command }) => [type, command].join("\u0000"),
  );
}

function getMetadata<T extends keyof KeyboardCommandHandler>(
  state: nearley.State,
): CommandRulePostProcessor<T>["metadata"] {
  return (state.rule.postprocess as unknown as CommandRulePostProcessor<T>)
    .metadata;
}

/**
 * Given a state, returns all root states that are reachable from it. We use this
 * to find out which top-level rules want a given token type.
 *
 * @param state The state to get the root states of
 * @returns A list of root states
 */
function getRootStates(state: nearley.State) {
  /** A queue of states to process; ensures we don't try to process state twice */
  const queue = new UniqueWorkQueue(state);
  const roots: State[] = [];

  for (const state of queue) {
    queue.push(...state.wantedBy);

    if (state.wantedBy.length === 0) {
      roots.push(state);
    }
  }

  return roots;
}

/**
 * Given a root state, returns a partial argument for the command that the state
 * represents. We could use this info to display which arguments have already
 * been filled out while a user is typing a command.
 * @param state A root state
 * @returns A partial argument for the command that the state represents
 */
function computePartialArg<T extends keyof KeyboardCommandHandler>(
  _state: nearley.State,
): Partial<Record<T, any>> {
  // FIXME: Fill this out
  return {};
}
