import { ActionDescriptor, CommandV6 } from "@cursorless/common";

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
export const spokenFormsFixture: Required<CommandV6>[] = [
  command("take air slice past bat", verticalRangeAction),
  command("take air slice bat", verticalRangeAction),

  command("take one tokens forward", tokenForwardAction),
  command("take one tokens", tokenForwardAction),
  command("take token forward", tokenForwardAction),
];

function command(
  spokenForm: string,
  action: ActionDescriptor,
): Required<CommandV6> {
  return {
    version: 6,
    spokenForm,
    usePrePhraseSnapshot: true,
    action,
  };
}
