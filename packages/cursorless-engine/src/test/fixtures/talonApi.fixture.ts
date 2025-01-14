import type {
  ActionDescriptor,
  GetTextActionOptions,
  PartialPrimitiveTargetDescriptor,
} from "@cursorless/common";
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
  source: decoratedPrimitiveTarget("a"),
  destination: { type: "implicit" },
};
const insertSingleWordTargetAction: ActionDescriptor = {
  name: "replace",
  destination: {
    type: "primitive",
    insertionMode: "to",
    target: decoratedPrimitiveTarget("a"),
  },
  replaceWith: ["hello"],
};
const insertMultipleWordsTargetAction: ActionDescriptor = {
  name: "replace",
  destination: {
    type: "primitive",
    insertionMode: "after",
    target: {
      type: "list",
      elements: [decoratedPrimitiveTarget("a"), decoratedPrimitiveTarget("b")],
    },
  },
  replaceWith: ["hello", "world"],
};
const insertSnippetAction: ActionDescriptor = {
  name: "insertSnippet",
  destination: { type: "implicit" },
  snippetDescription: {
    type: "custom",
    body: "Hello, $foo!  My name is $bar!",
  },
};
const insertSnippetWithScopeAction: ActionDescriptor = {
  name: "insertSnippet",
  destination: {
    type: "primitive",
    insertionMode: "after",
    target: decoratedPrimitiveTarget("a"),
  },
  snippetDescription: {
    type: "custom",
    body: "Hello, $foo!  My name is $bar!",
    scopeTypes: [{ type: "statement" }],
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
const alternateHighlightAirAndBatAction: ActionDescriptor = {
  name: "highlight",
  target: {
    type: "list",
    elements: [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "a",
        },
        modifiers: [],
      },
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "b",
        },
        modifiers: [],
      },
    ],
  },
  highlightId: "highlight1",
};
const alternateHighlightNothingAction: ActionDescriptor = {
  name: "highlight",
  target: {
    type: "primitive",
    mark: {
      type: "nothing",
    },
    modifiers: [],
  },
  highlightId: "highlight1",
};

function getTextAction(options: GetTextActionOptions): ActionDescriptor {
  return {
    name: "getText",
    options,
    target: decoratedPrimitiveTarget("a"),
  };
}

const parsedActionNoTargets: ActionDescriptor = {
  name: "parsed",
  content: "chuck block",
  arguments: [],
};
const parsedActionAir: ActionDescriptor = {
  name: "parsed",
  content: "chuck block <target>",
  arguments: [
    {
      type: "list",
      elements: [
        {
          type: "primitive",
          mark: {
            type: "decoratedSymbol",
            symbolColor: "default",
            character: "a",
          },
        },
        {
          type: "primitive",
          mark: {
            type: "decoratedSymbol",
            symbolColor: "default",
            character: "b",
          },
        },
      ],
    },
  ],
};
const parsedActionAirPlusBat: ActionDescriptor = {
  name: "parsed",
  content: "bring block <target1> after <target2>",
  arguments: [
    {
      type: "primitive",
      mark: {
        type: "decoratedSymbol",
        symbolColor: "default",
        character: "a",
      },
    },
    {
      type: "primitive",
      mark: {
        type: "decoratedSymbol",
        symbolColor: "default",
        character: "b",
      },
    },
  ],
};

/**
 * These test our Talon api using dummy spoken forms defined in
 * cursorless-talon-dev/src/cursorless_test.talon
 */
export const talonApiFixture = [
  spokenFormTest("test api command this", setSelectionAction),
  spokenFormTest("test api command bring air", replaceWithTargetAction),
  spokenFormTest("test api insert hello to air", insertSingleWordTargetAction),
  spokenFormTest(
    "test api insert hello and world after air and bat",
    insertMultipleWordsTargetAction,
  ),
  spokenFormTest("test api insert snippet", insertSnippetAction),
  spokenFormTest(
    "test api insert snippet after air",
    insertSnippetWithScopeAction,
  ),
  spokenFormTest("test api insert snippet by name", insertSnippetByNameAction),
  spokenFormTest("test api wrap with snippet this", wrapWithSnippetAction),
  spokenFormTest(
    "test api wrap with snippet by name this",
    wrapWithSnippetByNameAction,
  ),
  spokenFormTest(
    "test api get text air",
    getTextAction({ showDecorations: true, ensureSingleTarget: true }),
    ["apple"],
  ),
  spokenFormTest(
    "test api get text list on air",
    getTextAction({ showDecorations: true, ensureSingleTarget: false }),
    ["apple"],
  ),
  spokenFormTest(
    "test api get text hide decorations air",
    getTextAction({ showDecorations: false, ensureSingleTarget: true }),
    ["apple"],
  ),
  spokenFormTest(
    "test api get text hide decorations list on air",
    getTextAction({ showDecorations: false, ensureSingleTarget: false }),
    ["apple"],
  ),
  spokenFormTest(
    "test api extract decorated marks air past bat",
    alternateHighlightAirAndBatAction,
  ),
  spokenFormTest(
    "test api alternate highlight nothing",
    alternateHighlightNothingAction,
  ),
  spokenFormTest("test api parsed", parsedActionNoTargets),
  spokenFormTest("test api parsed air and bat", parsedActionAir),
  spokenFormTest("test api parsed air plus bat", parsedActionAirPlusBat),
];

function decoratedPrimitiveTarget(
  character: string,
): PartialPrimitiveTargetDescriptor {
  return {
    type: "primitive",
    mark: { type: "decoratedSymbol", symbolColor: "default", character },
  };
}
