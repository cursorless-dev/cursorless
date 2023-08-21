import { ActionDescriptor } from "@cursorless/common";
import { spokenFormTest } from "./spokenFormTest";

// See cursorless-talon-dev/src/cursorless_test.talon
const setSelectionAction: ActionDescriptor = {
  name: "setSelection",
  target: {
    type: "primitive",
    mark: { type: "cursor" },
  },
};
const replaceWithTargetAction: ActionDescriptor = {
  name: "replaceWithTarget",
  source: {
    type: "primitive",
    mark: { type: "decoratedSymbol", symbolColor: "default", character: "a" },
  },
  destination: { type: "implicit" },
};
const insertSnippetAction: ActionDescriptor = {
  name: "insertSnippet",
  destination: { type: "implicit" },
  snippetDescription: {
    type: "custom",
    body: "Hello, $foo!  My name is $bar!",
  },
};
const insertSnippetByNameAction: ActionDescriptor = {
  name: "insertSnippet",
  destination: { type: "implicit" },
  snippetDescription: {
    type: "named",
    name: "functionDeclaration",
  },
};
const wrapWithSnippetAction: ActionDescriptor = {
  name: "wrapWithSnippet",
  target: {
    type: "primitive",
    mark: { type: "cursor" },
  },
  snippetDescription: {
    type: "custom",
    body: "Hello, $foo!  My name is $bar!",
    variableName: "foo",
    scopeType: { type: "statement" },
  },
};
const wrapWithSnippetByNameAction: ActionDescriptor = {
  name: "wrapWithSnippet",
  target: {
    type: "primitive",
    mark: { type: "cursor" },
  },
  snippetDescription: {
    type: "named",
    name: "functionDeclaration",
    variableName: "body",
  },
};

/**
 * These test our Talon api using dummy spoken forms defined in
 * cursorless-talon-dev/src/cursorless_test.talon
 */
export const talonApiFixture = [
  spokenFormTest("test api command this", setSelectionAction),
  spokenFormTest("test api command bring air", replaceWithTargetAction),
  spokenFormTest("test api insert snippet", insertSnippetAction),
  spokenFormTest("test api insert snippet by name", insertSnippetByNameAction),
  spokenFormTest("test api wrap with snippet this", wrapWithSnippetAction),
  spokenFormTest(
    "test api wrap with snippet by name this",
    wrapWithSnippetByNameAction,
  ),
];
