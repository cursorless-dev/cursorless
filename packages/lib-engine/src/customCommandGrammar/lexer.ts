import type {
  BringMoveActionDescriptor,
  InsertionMode,
} from "@cursorless/lib-common";
import {
  simpleActionNames,
  simpleScopeTypeTypes,
  surroundingPairNames,
} from "@cursorless/lib-common";
import { connectives } from "../generateSpokenForm/defaultSpokenForms/connectives";
import { marks } from "../generateSpokenForm/defaultSpokenForms/marks";
import { defaultSpokenFormMap } from "../spokenForms/defaultSpokenFormMap";
import { CommandLexer } from "./CommandLexer";

interface Token {
  type: string;
  value: string;
}

const tokens: Record<string, Token> = {};

// FIXME: Remove the duplication below?

for (const simpleActionName of simpleActionNames) {
  const { spokenForms } = defaultSpokenFormMap.action[simpleActionName];
  for (const spokenForm of spokenForms) {
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
  const { spokenForms } = defaultSpokenFormMap.action[bringMoveActionName];
  for (const spokenForm of spokenForms) {
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

const nextSpokenForms = defaultSpokenFormMap.modifierExtra.next.spokenForms;
for (const spokenForm of nextSpokenForms) {
  tokens[spokenForm] = {
    type: "direction",
    value: "forward",
  };
}

const previousSpokenForms =
  defaultSpokenFormMap.modifierExtra.previous.spokenForms;
for (const spokenForm of previousSpokenForms) {
  tokens[spokenForm] = {
    type: "direction",
    value: "backward",
  };
}

export const lexer = new CommandLexer({
  ws: /[ \t]+/u,
  placeholderTarget: {
    match: /<target\d*>/u,
    value: (text) => text.slice(7, -1),
  },
  token: {
    match: Object.keys(tokens),
    type: (text) => tokens[text].type,
    value: (text) => tokens[text].value,
  },
});
