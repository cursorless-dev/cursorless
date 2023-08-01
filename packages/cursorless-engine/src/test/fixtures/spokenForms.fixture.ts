import { ActionDescriptor, CommandV6 } from "@cursorless/common";

const rangeAction: ActionDescriptor = {
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

const relativeAction: ActionDescriptor = {
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

export const spokenFormsFixture: Required<CommandV6>[] = [
  command("take air slice past bat", rangeAction),
  command("take air slice bat", rangeAction),

  command("take one tokens forward", relativeAction),
  command("take one tokens", relativeAction),
  command("take token forward", relativeAction),
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
