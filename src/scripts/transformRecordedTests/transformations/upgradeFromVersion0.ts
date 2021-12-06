import { TestCaseFixture } from "../../../testUtil/TestCase";
import { transformPartialPrimitiveTargets } from "../../../util/getPrimitiveTargets";
import { PartialPrimitiveTarget } from "../../../typings/Types";

export function upgradeFromVersion0(fixture: TestCaseFixture) {
  const { command, spokenForm, ...rest } = fixture as any;

  const {
    actionName: oldAction, action: newAction, partialTargets: oldTargets, targets: newTargets, extraArgs,
  } = command;

  const targets = transformPartialPrimitiveTargets(
    newTargets ?? oldTargets,
    (target: PartialPrimitiveTarget) => {
      if (target.mark?.type === "decoratedSymbol") {
        (target.mark as any).usePrePhraseSnapshot = undefined;
      }
      return target;
    }
  );

  return {
    command: {
      version: 1,
      spokenForm,
      action: newAction ?? oldAction,
      targets,
      extraArgs,
    },
    ...rest,
  };
}
