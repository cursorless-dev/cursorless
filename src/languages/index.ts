import { NodeMatcher, ScopeType } from "../Types";
import json from "./json";
import python from "./python";
import typescript from "./typescript";

export const nodeMatchers: Record<string, Record<ScopeType, NodeMatcher>> = {
  javascript: typescript,
  javascriptreact: typescript,
  json,
  jsonc: json,
  python,
  typescript,
  typescriptreact: typescript,
};
