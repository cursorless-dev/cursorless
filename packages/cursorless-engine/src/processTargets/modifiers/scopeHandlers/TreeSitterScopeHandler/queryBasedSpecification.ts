import { SimpleScopeTypeType, simpleScopeTypeTypes } from "@cursorless/common";
import * as fs from "fs";
import * as path from "path";
import { NodeMatcherAlternative } from "../../../../typings/Types";
import { defaultMatcher } from "./queryNodeMatchers";

function getMatchers(
  queries: string,
): Partial<Record<SimpleScopeTypeType, NodeMatcherAlternative>> {
  const matchers: Partial<Record<SimpleScopeTypeType, NodeMatcherAlternative>> =
    {};
  for (const scopeTypeType of simpleScopeTypeTypes) {
    generateMatcher(queries, scopeTypeType, matchers);
  }
  return matchers;
}

function generateMatcher(
  queries: string,
  scopeTypeType: SimpleScopeTypeType,
  matchers: Partial<Record<SimpleScopeTypeType, NodeMatcherAlternative>>,
) {
  if (queries.match(`@${scopeTypeType}[^a-zA-Z]`)) {
    const isIterationScopePresent = !!queries.match(
      `@${scopeTypeType}.iterationScope[^a-zA-Z]`,
    );
    matchers[scopeTypeType as SimpleScopeTypeType] = defaultMatcher(
      scopeTypeType,
      isIterationScopePresent,
      queries,
    );
  }
}

export default function queryBasedSpecification(languageName: string) {
  const queryPath = fs.readFileSync(
    path.join(__dirname, `../queries/${languageName}/scopeTypes.scm`),
    "utf-8",
  );

  return getMatchers(queryPath);
}
