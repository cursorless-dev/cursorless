import {
  BringMoveActionDescriptor,
  InsertionMode,
  simpleActionNames,
  simpleScopeTypeTypes,
  surroundingPairNames,
} from "@cursorless/common";
import { actions } from "../generateSpokenForm/defaultSpokenForms/actions";
import { marks } from "../generateSpokenForm/defaultSpokenForms/marks";
import { defaultSpokenFormMap } from "../spokenForms/defaultSpokenFormMap";
import { connectives } from "../generateSpokenForm/defaultSpokenForms/connectives";
import { CommandLexer } from "./CommandLexer";

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

const bringMoveActionNames: BringMoveActionDescriptor["name"][] = [
  "replaceWithTarget",
  "moveToTarget",
];

for (const bringMoveActionName of bringMoveActionNames) {
  const spokenForm = actions[bringMoveActionName];
  if (spokenForm != null) {
    tokens[spokenForm] = {
      type: "bringMove",
      value: bringMoveActionName,
    };
  }
}

const insertionModes: InsertionMode[] = ["before", "after", "to"];

for (const insertionMode of insertionModes) {
  const spokenForm =
    connectives[
      insertionMode === "to" ? "sourceDestinationConnective" : insertionMode
    ];
  tokens[spokenForm] = {
    type: "insertionMode",
    value: insertionMode,
  };
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

export const lexer = new CommandLexer({
  ws: /[ \t]+/,
  placeholderTarget: {
    match: /<target\d*>/,
    value: (text) => text.slice(7, -1),
  },
  token: {
    match: Object.keys(tokens),
    type: (text) => tokens[text].type,
    value: (text) => tokens[text].value,
  },
});
