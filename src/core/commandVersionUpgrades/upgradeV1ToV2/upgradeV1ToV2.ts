import { flow } from "lodash";
import {
  Modifier,
  PartialPrimitiveTargetDesc,
  PartialRangeTargetDesc,
  PartialTargetDesc,
  ScopeType,
} from "../../../typings/target.types";
import { ActionType } from "../../../actions/actions.types";
import { transformPartialPrimitiveTargets } from "../../../util/getPrimitiveTargets";
import { CommandV2 } from "../../commandRunner/command.types";
import {
  CommandV1,
  ModifierV0V1,
  PartialPrimitiveTargetV0V1,
  PartialTargetV0V1,
} from "./commandV1.types";
import { upgradeStrictHere } from "./upgradeStrictHere";

export function upgradeV1ToV2(command: CommandV1): CommandV2 {
  return {
    spokenForm: command.spokenForm,
    action: command.action as ActionType,
    targets: upgradeTargets(command.targets),
    extraArgs: command.extraArgs,
    usePrePhraseSnapshot: command.usePrePhraseSnapshot ?? false,
    version: 2,
  };
}

function upgradeModifier(modifier: ModifierV0V1): Modifier | Modifier[] | null {
  switch (modifier.type) {
    case "identity":
      return null;

    case "containingScope":
      const {includeSiblings, scopeType, ...rest} = modifier;
      return {type: includeSiblings ? "everyScope" : "containingScope", scopeType: scopeType as ScopeType, ...rest};

    case "surroundingPair":
      const { delimiterInclusion, ...rest } = modifier;
      if (delimiterInclusion === "interiorOnly") {
        return [rest, { type: "interiorOnly" }];
      }
      if (delimiterInclusion === "excludeInterior") {
        return [rest, { type: "excludeInterior" }];
      }
      return rest;

    default:
      return modifier;
  }
}

function upgradePrimitiveTarget(
  target: PartialPrimitiveTargetV0V1
): PartialPrimitiveTargetDesc {
  const {
    mark,
    insideOutsideType,
    modifier,
    isImplicit,
    selectionType,
    position,
    ...rest
  } = target;
  const modifiers: Modifier[] = [];

  if (selectionType) {
    modifiers.push({ type: "containingScope", scopeType: selectionType });
  }

  if (modifier) {
    const mod = upgradeModifier(modifier);
    if (mod) {
      if (Array.isArray(mod)) {
        modifiers.push(...mod);
      } else {
        modifiers.push(mod);
      }
    }
  }

  if (isImplicit) {
    modifiers.push({ type: "toRawSelection" });
  }

  if (position && position !== "contents") {
    if (position === "before") {
      if (insideOutsideType === "inside") {
        modifiers.push({ type: "position", position: "start" });
      } else {
        modifiers.push({ type: "position", position: "before" });
      }
    } else {
      if (insideOutsideType === "inside") {
        modifiers.push({ type: "position", position: "end" });
      } else {
        modifiers.push({ type: "position", position: "after" });
      }
    }
  }

  const newMark = mark?.type === "cursorToken" ? undefined : mark;

  return {
    ...rest,
    mark: newMark,
    // Modifiers are processed backwards
    modifiers: modifiers.length ? modifiers.reverse() : undefined,
  };
}

function upgradeTarget(target: PartialTargetV0V1): PartialTargetDesc {
  switch (target.type) {
    case "list":
      return {
        ...target,
        elements: target.elements.map(
          (target) =>
            upgradeTarget(target) as
              | PartialPrimitiveTargetDesc
              | PartialRangeTargetDesc
        ),
      };
    case "range":
      return {
        ...target,
        anchor: upgradePrimitiveTarget(target.start),
        active: upgradePrimitiveTarget(target.end),
      };
    case "primitive":
      return upgradePrimitiveTarget(target);
  }
}

function upgradeTargets(partialTargets: PartialTargetV0V1[]) {
  const partialTargetsV2: PartialTargetDesc[] =
    partialTargets.map(upgradeTarget);
  return transformPartialPrimitiveTargets(
    partialTargetsV2,
    flow(upgradeStrictHere)
  );
}
