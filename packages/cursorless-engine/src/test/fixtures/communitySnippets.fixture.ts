import type { ActionDescriptor } from "@cursorless/common";
import { spokenFormTest } from "./spokenFormTest";

const snippetAfterAction: ActionDescriptor = {
  name: "insertSnippet",
  destination: {
    type: "primitive",
    insertionMode: "after",
    target: {
      type: "primitive",
      mark: {
        character: "a",
        symbolColor: "default",
        type: "decoratedSymbol",
      },
    },
  },
  snippetDescription: {
    type: "list",
    snippets: [
      {
        type: "custom",
        body: "```\n$0\n```",
      },
    ],
  },
};

/**
 * These are spoken forms that have more than one way to say them, so we have to
 * pick one in our spoken form generator, meaning we can't test the other in our
 * Talon tests by relying on our recorded test fixtures alone.
 */
export const communitySnippetsSpokenFormsFixture = [
  spokenFormTest("snip code after air", snippetAfterAction, undefined),
];
