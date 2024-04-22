import { Parser, Grammar } from "nearley";
import grammar from "./generated/grammar";
import { ScopeType } from "@cursorless/common";

function getScopeTypeParser(): Parser {
  return new Parser(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Grammar.fromCompiled({ ...grammar, ParserStart: "scopeType" }),
  );
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
