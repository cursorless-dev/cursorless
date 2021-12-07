// XXX: Make this language-specific if it starts to get unwieldy
/**
 * A list of node types that are allowed to be parents of an angle bracket.
 * Having this list allows us to avoid trying to treat a greater-than sign as an
 * angle bracket
 */
export const ALLOWABLE_ANGLE_BRACKET_PARENTS = [
  "end_tag",
  "jsx_closing_element",
  "jsx_opening_element",
  "jsx_self_closing_element",
  "self_closing_tag",
  "start_tag",
  "type_parameters",
];
