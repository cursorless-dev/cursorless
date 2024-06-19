import { ScopeType, type ActionDescriptor } from "@cursorless/common";
import { Grammar, Parser } from "nearley";
import grammar from "./generated/grammar";

function getScopeTypeParser(): Parser {
  return new Parser(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Grammar.fromCompiled({ ...grammar, ParserStart: "scopeType" }),
  );
}

function getActionParser(): Parser {
  return new Parser(Grammar.fromCompiled({ ...grammar }));
}

/**
 * Given a textual representation of a scope type, parse it into a scope type.
 *
 * @param input A textual representation of a scope type
 * @returns A parsed scope type
 */
export function parseScopeType(input: string): ScopeType {
  const parser = getScopeTypeParser();
  parser.feed(input);

  if (parser.results.length !== 1) {
    throw new Error(
      `Expected exactly one result, got ${parser.results.length}`,
    );
  }

  return parser.results[0] as ScopeType;
}

/**
 * Given a textual representation of a action, parse it into a action descriptor.
 *
 * @param input A textual representation of a action
 * @returns A parsed action descriptor
 */
export function parseAction(input: string): ActionDescriptor {
  const parser = getActionParser();
  parser.feed(input);

  if (parser.results.length !== 1) {
    throw new Error(
      `Expected exactly one result, got ${parser.results.length}`,
    );
  }

  return parser.results[0] as ActionDescriptor;
}
