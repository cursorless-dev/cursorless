import nearley, { State } from "nearley";
import { isEqual, times } from "lodash";
import { CommandRulePostProcessor } from "./CommandRulePostProcessor";
import { DefaultMap, uniqWithHash } from "@cursorless/common";
import { KeyboardCommandHandler } from "../KeyboardCommandHandler";

export interface AcceptableTokenType {
  type: any;
  command: keyof KeyboardCommandHandler;
  partialArg: any;
}

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
export function getAcceptableTokenTypes(
  parser: nearley.Parser,
): AcceptableTokenType[] {
  return uniqWithHash(
    parser.table[parser.table.length - 1].scannable.flatMap(
      (scannableState) => {
        /** The token type */
        const { type } = scannableState.rule.symbols[scannableState.dot];

        return computeRootStatePartialArgs(scannableState).map(
          ({ state, partialArg }) => ({
            type,
            command: getMetadata(state).type,
            partialArg,
          }),
        );
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

// Prevent infinite recursion
const MAX_VISITS = 3;

/** Indicates that the given symbol hasn't been typed yet */
export const MISSING = Symbol("missing");

/**
 * Given a state, returns all root states that are reachable from it, including
 * partially filled out arguments to the given rule. We use this to find out
 * which top-level rules want a given token type.
 *
 * @param state The state to get the root states of
 * @param lastSymbol The partially filled out symbol that is currently being
 * constructed
 * @param visitCounts A map of states to the number of times they've been
 * visited. We use this to prevent infinite recursion
 * @param roots The list of root states
 * @returns A list of root states
 */
function computeRootStatePartialArgs(
  state: nearley.State,
  lastSymbol: any = MISSING,
  visitCounts = new DefaultMap<State, number>(() => 0),
  roots: { state: State; partialArg: any }[] = [],
) {
  const visitCount = visitCounts.get(state);
  if (visitCount > MAX_VISITS) {
    return roots;
  }
  visitCounts.set(state, visitCount + 1);

  let partialArg: any;
  try {
    const argList = [...getCompletedSymbols(state), lastSymbol];
    argList.push(
      ...times(state.rule.symbols.length - argList.length, () => MISSING),
    );
    partialArg = state.rule.postprocess?.(argList) ?? argList;
  } catch (err) {
    partialArg = MISSING;
  }

  if (state.wantedBy.length === 0) {
    roots.push({ state, partialArg });
  }

  for (const parent of state.wantedBy) {
    // If we're not a root state, we recurse on all states that want this state,
    // passing them our partial argument so that they can use it when constructing
    // their partial argument
    computeRootStatePartialArgs(parent, partialArg, visitCounts, roots);
  }

  return roots;
}

/**
 * Given a state, returns a list of the symbols that have already been
 * completed.
 *
 * @param state A state
 * @returns A list of completed symbols
 */
function getCompletedSymbols(state: nearley.State) {
  let currentState = state;
  const completedSymbols: any[] = [];

  while (currentState.dot > 0) {
    completedSymbols.push(currentState.right!.data);
    currentState = currentState.left!;
  }

  return completedSymbols;
}
