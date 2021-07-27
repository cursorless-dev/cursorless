import { NodeMatcher, ScopeType } from "../Types";
import json from "./json";
import python from "./python";
import typescript from "./typescript";
import csharp from "./csharp";

const languageMatchers: Record<string, Record<ScopeType, NodeMatcher>> = {
  csharp: csharp,
  javascript: typescript,
  javascriptreact: typescript,
  json,
  jsonc: json,
  python,
  typescript,
  typescriptreact: typescript,
};

export function getNodeMatcher(
  languageId: string,
  scopeType: ScopeType
): NodeMatcher {
  const matchers = languageMatchers[languageId];
  if (matchers == null) {
    throw Error(`Language '${languageId}' is not implemented yet`);
  }
  const matcher = matchers[scopeType];
  if (matcher == null) {
    throw Error(`Scope '${scopeType}' is not implemented yet`);
  }
  return matcher;
}
