import { PartialPrimitiveTargetDescriptor } from "@cursorless/common";
import { TestCaseFixture } from "@cursorless/common";
import { transformPartialPrimitiveTargets } from "../../../util/getPrimitiveTargets";

export function upgradeFromVersion0(fixture: TestCaseFixture) {
  const { command, spokenForm: oldSpokenForm, ...rest } = fixture as any;

  const {
    spokenForm: newSpokenForm,
    actionName: oldAction,
    action: newAction,
    partialTargets: oldTargets,
    targets: newTargets,
    extraArgs,
  } = command;

  const targets = transformPartialPrimitiveTargets(
    newTargets ?? oldTargets,
    (target: PartialPrimitiveTargetDescriptor) => {
      if (target.mark?.type === "decoratedSymbol") {
        (target.mark as any).usePrePhraseSnapshot = undefined;
      }
      return target;
    },
  );

  return {
    command: {
      version: 1,
      spokenForm: newSpokenForm ?? oldSpokenForm,
      action: newAction ?? oldAction,
      targets,
      extraArgs,
    },
    ...rest,
  };
}
