import { ActionDescriptor } from "@cursorless/common";
import { multiActionSpokenFormTest } from "./spokenFormTest";

const getTextAction: ActionDescriptor = {
  name: "getText",
  target: {
    type: "primitive",
    mark: { type: "cursor" },
  },
  options: {
    showDecorations: false,
  },
};

const phonesReplaceAction: ActionDescriptor = {
  name: "replace",
  destination: {
    type: "primitive",
    insertionMode: "to",
    target: {
      type: "primitive",
      mark: { type: "cursor" },
    },
  },
  replaceWith: ["beet"],
};

const reformatReplaceAction: ActionDescriptor = {
  name: "replace",
  destination: {
    type: "primitive",
    insertionMode: "to",
    target: {
      type: "primitive",
      mark: { type: "cursor" },
    },
  },
  replaceWith: ["helloWorld"],
};

/**
 * These test actions that are implemented Talon-side using multiple steps
 */
export const multiActionFixture = [
  multiActionSpokenFormTest(
    "phones this",
    [getTextAction, phonesReplaceAction],
    ["beat"],
  ),
  multiActionSpokenFormTest(
    "format camel at this",
    [getTextAction, reformatReplaceAction],
    ["hello_world"],
  ),
];
