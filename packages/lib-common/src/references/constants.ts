import { graphemeDefaultSpokenForms } from "./spokenForms/graphemeDefaultSpokenForms";
import { hatColorDefaultSpokenForms } from "./spokenForms/markDefaultSpokenForms";

// Template variables
export const VAR_SPOKEN_FORM = "<spokenForm>";
export const VAR_TARGET = "<target>";
export const VAR_TARGET_1 = "<target 1>";
export const VAR_TARGET_2 = "<target 2>";
export const VAR_DESTINATION = "<destination>";
export const VAR_SCOPE = "<scope>";
export const VAR_SNIPPET = "<snippet>";
export const VAR_PAIR = "<pair>";
export const VAR_FORMATTER = "<formatter>";
export const VAR_NUMBER = "<number>";
export const VAR_ORDINAL = "<ordinal>";
export const VAR_MODIFIER = "<modifier>";
export const VAR_CHARACTER = "<character>";

// Targets
export const TARGET = `${hatColorDefaultSpokenForms.blue} ${graphemeDefaultSpokenForms.a}`;
export const TARGET_DESC = "token containing letter 'a' with a blue hat";
export const TARGET_2 = `${hatColorDefaultSpokenForms.green} ${graphemeDefaultSpokenForms.b}`;
export const TARGET_2_DESC = "token containing letter 'b' with a green hat";
export const TARGET_NUMBER = `${hatColorDefaultSpokenForms.blue} ${graphemeDefaultSpokenForms["5"]}`;
export const TARGET_NUMBER_DESC = "token containing number '5' with a blue hat";

// Actions
export const SET_SELECTION = "take";
export const REMOVE = "chuck";

// Modifiers
export const EVERY = "every";

// Scopes
export const LINE = "line";
export const ITEM = "item";
export const STATEMENT = "state";

// Misc
export const FORMATTER_CAMEL = "camel";
export const SNIPPET_IF = "if";
