import { NodeMatcher, ScopeType } from "../Types";
import json from "./json";
import python from "./python";
import typescript from "./typescript";
import csharp from "./csharp";
import java from "./java";
import { notSupported } from "../nodeMatchers";

const languageMatchers: Record<string, Record<ScopeType, NodeMatcher>> = {
  csharp: csharp,
  javascript: typescript,
  javascriptreact: typescript,
  json,
  jsonc: json,
  python,
  typescript,
  typescriptreact: typescript,
  java,
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
    return notSupported;
  }
  return matcher;
}
