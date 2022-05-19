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

function upgradeModifier(modifier: ModifierV0V1): Modifier[] {
  switch (modifier.type) {
    case "identity":
      return [];

    case "containingScope": {
      const { includeSiblings, scopeType, type, ...rest } = modifier;
      return [
        {
          type: includeSiblings ? "everyScope" : "containingScope",
          scopeType: scopeType as ScopeType,
          ...rest,
        },
      ];
    }

    case "surroundingPair": {
      const { delimiterInclusion, ...rest } = modifier;
      if (delimiterInclusion === "interiorOnly") {
        return [{ type: "interiorOnly" }, rest];
      }
      if (delimiterInclusion === "excludeInterior") {
        return [{ type: "excludeInterior" }, rest];
      }
      return [rest];
    }

    default:
      return [modifier];
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

  if (isImplicit) {
    modifiers.push({ type: "toRawSelection" });
  }

  if (selectionType) {
    switch (selectionType) {
      case "token":
        if (modifier?.type === "subpiece") {
          break;
        }
      case "line":
        if (mark?.type === "lineNumber") {
          break;
        }
      default:
        modifiers.push({ type: "containingScope", scopeType: selectionType });
    }
  }

  if (modifier) {
    modifiers.push(...upgradeModifier(modifier));
  }

  return {
    ...rest,
    // Cursor token is just cursor position but treated as a token. This is done in the pipeline for normal cursor now
    mark: mark?.type === "cursorToken" ? undefined : mark,
    modifiers,
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
