import {
  simpleActionNames,
  simpleScopeTypeTypes,
  surroundingPairNames,
} from "@cursorless/common";
import moo from "moo";
import { defaultSpokenFormMap } from "../spokenForms/defaultSpokenFormMap";
import { actions } from "../generateSpokenForm/defaultSpokenForms/actions";

interface Token {
  type: string;
  value: string;
}

const tokens: Record<string, Token> = {};

// FIXME: Remove the duplication below?

for (const simpleActionName of simpleActionNames) {
  const spokenForm = actions[simpleActionName];
  if (spokenForm != null) {
    tokens[spokenForm] = {
      type: "simpleActionName",
      value: simpleActionName,
    };
  }
}

for (const simpleScopeTypeType of simpleScopeTypeTypes) {
  const { spokenForms } =
    defaultSpokenFormMap.simpleScopeTypeType[simpleScopeTypeType];
  for (const spokenForm of spokenForms) {
    tokens[spokenForm] = {
      type: "simpleScopeTypeType",
      value: simpleScopeTypeType,
    };
  }
}

for (const pairedDelimiter of surroundingPairNames) {
  const { spokenForms } = defaultSpokenFormMap.pairedDelimiter[pairedDelimiter];
  for (const spokenForm of spokenForms) {
    tokens[spokenForm] = {
      type: "pairedDelimiter",
      value: pairedDelimiter,
    };
  }
}

export const lexer = moo.compile({
  ws: /[ \t]+/,
  token: {
    match: Object.keys(tokens),
    type: (text) => tokens[text].type,
    value: (text) => tokens[text].value,
  },
});

(lexer as any).transform = (token: { value: string }) => token.value;
