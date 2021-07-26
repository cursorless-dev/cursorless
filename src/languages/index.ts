import { NodeMatcher, NodeMatcherAlternative, ScopeType } from "../Types";
import { patternMatcher } from "../nodeMatchers";
import json from "./json";
import python from "./python";
import typescript from "./typescript";
import csharp from "./csharp";

const nodeMatchers: Record<string, Record<ScopeType, NodeMatcherAlternative>> =
  {
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
  const languageMatchers = nodeMatchers[languageId];
  if (languageMatchers == null) {
    throw Error(`Language ${languageId} is not implemented yet`);
  }
  const matcher = languageMatchers[scopeType];
  if (matcher == null) {
    throw Error(`Can't find matcher for scope ${scopeType}`);
  }
  if (Array.isArray(matcher)) {
    return patternMatcher(...matcher);
  }
  if (typeof matcher === "string") {
    return patternMatcher(matcher);
  }
  return matcher;
}
