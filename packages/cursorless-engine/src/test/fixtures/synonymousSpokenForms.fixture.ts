import { ActionDescriptor } from "@cursorless/common";
import { spokenFormTest } from "./spokenFormTest";

const verticalRangeAction: ActionDescriptor = {
  name: "setSelection",
  target: {
    type: "range",
    anchor: {
      type: "primitive",
      mark: { type: "decoratedSymbol", symbolColor: "default", character: "a" },
    },
    active: {
      type: "primitive",
      mark: { type: "decoratedSymbol", symbolColor: "default", character: "b" },
    },
    excludeAnchor: false,
    excludeActive: false,
    rangeType: "vertical",
  },
};

const tokenForwardAction: ActionDescriptor = {
  name: "setSelection",
  target: {
    type: "primitive",
    modifiers: [
      {
        type: "relativeScope",
        scopeType: {
          type: "token",
        },
        offset: 0,
        length: 1,
        direction: "forward",
      },
    ],
  },
};

/**
 * These are spoken forms that have more than one way to say them, so we have to
 * pick one in our spoken form generator, meaning we can't test the other in our
 * Talon tests by relying on our recorded test fixtures alone.
 */
export const synonymousSpokenFormsFixture = [
  spokenFormTest("take air slice past bat", verticalRangeAction),
  spokenFormTest("take air slice bat", verticalRangeAction),

  spokenFormTest("take one tokens forward", tokenForwardAction),
  spokenFormTest("take one tokens", tokenForwardAction),
  spokenFormTest("take token forward", tokenForwardAction),
];
