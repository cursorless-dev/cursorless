import {
  simpleActionNames,
  simpleScopeTypeTypes,
  surroundingPairNames,
} from "@cursorless/common";
import moo from "moo";
import { actions } from "../generateSpokenForm/defaultSpokenForms/actions";
import { marks } from "../generateSpokenForm/defaultSpokenForms/marks";
import { defaultSpokenFormMap } from "../spokenForms/defaultSpokenFormMap";

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

for (const [mark, spokenForm] of Object.entries(marks)) {
  if (spokenForm != null) {
    tokens[spokenForm] = {
      type: "simpleMarkType",
      value: mark,
    };
  }
}

tokens["<target>"] = {
  type: "placeholderMark",
  value: "placeholder",
};

export const lexer = moo.compile({
  ws: /[ \t]+/,
  token: {
    match: Object.keys(tokens),
    type: (text) => tokens[text].type,
    value: (text) => tokens[text].value,
  },
});

(lexer as any).transform = (token: { value: string }) => token.value;
