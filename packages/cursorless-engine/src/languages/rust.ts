import type { SimpleScopeTypeType } from "@cursorless/common";
import type { NodeMatcherAlternative } from "../typings/Types";
import { argumentMatcher, createPatternMatchers } from "../util/nodeMatchers";

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  argumentOrParameter: argumentMatcher(
    "arguments",
    "parameters",
    "meta_arguments",
    "type_parameters",
    "ordered_field_declaration_list",
  ),
};

export default createPatternMatchers(nodeMatchers);
