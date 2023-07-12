import {
  ActionCommandV5,
  ActionDescriptor,
  CommandV5,
  CommandV6,
  DestinationDescriptor,
  ExecuteCommandOptions,
  HighlightId,
  ImplicitDestinationDescriptor,
  ImplicitTargetDescriptor,
  InsertSnippetArg,
  InsertionMode,
  ListDestinationDescriptor,
  Modifier,
  ModifierV5,
  PartialListTargetDescriptor,
  PartialListTargetDescriptorV5,
  PartialPrimitiveTargetDescriptor,
  PartialPrimitiveTargetDescriptorV5,
  PartialRangeTargetDescriptor,
  PartialRangeTargetDescriptorV5,
  PartialTargetDescriptor,
  PartialTargetDescriptorV5,
  PositionModifierV5,
  PrimitiveDestinationDescriptor,
  ReplaceWith,
  WrapWithSnippetArg,
} from "@cursorless/common";
import canonicalizeActionName from "./canonicalizeActionName";

export function upgradeV5ToV6(command: CommandV5): CommandV6 {
  return {
    version: 6,
    spokenForm: command.spokenForm,
    usePrePhraseSnapshot: command.usePrePhraseSnapshot,
    action: upgradeAction(command.action, command.targets),
  };
}

function upgradeAction(
  action: ActionCommandV5,
  targets: PartialTargetDescriptorV5[],
): ActionDescriptor {
  // We canonicalize once and for all
  const name = canonicalizeActionName(action.name);

  switch (name) {
    case "replaceWithTarget":
    case "moveToTarget":
      return {
        name,
        source: upgradeTarget(targets[0]),
        destination: targetToDestination(targets[1]),
      };
    case "swapTargets":
      return {
        name,
        target1: upgradeTarget(targets[0]),
        target2: upgradeTarget(targets[1]),
      };
    case "callAsFunction":
      return {
        name,
        callee: upgradeTarget(targets[0]),
        argument: upgradeTarget(targets[1]),
      };
    case "pasteFromClipboard":
      return {
        name,
        destination: targetToDestination(targets[0]),
      };
    case "wrapWithPairedDelimiter":
    case "rewrapWithPairedDelimiter":
      return {
        name,
        left: action.args![0] as string,
        right: action.args![1] as string,
        target: upgradeTarget(targets[0]),
      };
    case "generateSnippet":
      return {
        name,
        snippetName: action.args?.[0] as string,
        target: upgradeTarget(targets[0]),
      };
    case "insertSnippet":
      return {
        name,
        snippetDescription: action.args![0] as InsertSnippetArg,
        destination: targetToDestination(targets[0]),
      };
    case "wrapWithSnippet":
      return {
        name,
        snippetDescription: action.args![0] as WrapWithSnippetArg,
        target: upgradeTarget(targets[0]),
      };
    case "executeCommand":
      return {
        name,
        commandId: action.args![0] as string,
        options: action.args?.[1] as ExecuteCommandOptions,
        target: upgradeTarget(targets[0]),
      };
    case "replace":
      return {
        name,
        replaceWith: action.args![0] as ReplaceWith,
        destination: targetToDestination(targets[0]),
      };
    case "highlight":
      return {
        name,
        highlightId: action.args?.[0] as HighlightId,
        target: upgradeTarget(targets[0]),
      };
    case "editNew":
      return {
        name,
        destination: targetToDestination(targets[0]),
      };
    default:
      return {
        name,
        target: upgradeTarget(targets[0]),
      };
  }
}

function upgradeTarget(
  target: PartialTargetDescriptorV5,
): PartialTargetDescriptor {
  switch (target.type) {
    case "list":
      return upgradeListTarget(target);
    case "range":
      return upgradeRangeTarget(target);
    case "primitive":
      return upgradePrimitiveTarget(target);
    case "implicit":
      return target;
  }
}

function upgradeNonImplicitTarget(
  target:
    | PartialPrimitiveTargetDescriptorV5
    | PartialRangeTargetDescriptorV5
    | PartialListTargetDescriptorV5,
) {
  switch (target.type) {
    case "list":
      return upgradeListTarget(target);
    case "range":
      return upgradeRangeTarget(target);
    case "primitive":
      return upgradePrimitiveTarget(target);
  }
}

function upgradeListTarget(
  target: PartialListTargetDescriptorV5,
): PartialListTargetDescriptor {
  return {
    ...target,
    elements: target.elements.map((element) => {
      switch (element.type) {
        case "range":
          return upgradeRangeTarget(element);
        case "primitive":
          return upgradePrimitiveTarget(element);
      }
    }),
  };
}

function upgradeRangeTarget(
  target: PartialRangeTargetDescriptorV5,
): PartialRangeTargetDescriptor {
  const { anchor, active } = target;
  return {
    ...target,
    anchor:
      anchor.type === "implicit" ? anchor : upgradePrimitiveTarget(anchor),
    active: upgradePrimitiveTarget(active),
  };
}

function upgradePrimitiveTarget(
  target: PartialPrimitiveTargetDescriptorV5,
): PartialPrimitiveTargetDescriptor {
  return {
    ...target,
    modifiers: getModifiers(target.modifiers),
  };
}

function targetToDestination(
  target: PartialTargetDescriptorV5,
): DestinationDescriptor {
  switch (target.type) {
    case "list":
      return listTargetToDestination(target);
    case "range":
      return rangeTargetToDestination(target);
    case "primitive":
      return primitiveTargetToDestination(target);
    case "implicit":
      return implicitTargetToDestination();
  }
}

function listTargetToDestination(
  target: PartialListTargetDescriptorV5,
): DestinationDescriptor {
  const destinations: PrimitiveDestinationDescriptor[] = [];
  target.elements.forEach((element) => {
    const insertionMode = getInsertionMode(element);
    if (insertionMode != null || destinations.length === 0) {
      destinations.push({
        type: "primitive",
        insertionMode: insertionMode ?? "to",
        target: upgradeNonImplicitTarget(element),
      });
    } else {
      destinations.push({
        type: "primitive",
        insertionMode: destinations[destinations.length - 1].insertionMode,
        target: upgradeNonImplicitTarget(element),
      });
    }
  });
  if (destinations.length > 1) {
    return {
      type: "list",
      destinations,
    } as ListDestinationDescriptor;
  }
  return destinations[0];
}

function rangeTargetToDestination(
  target: PartialRangeTargetDescriptorV5,
): PrimitiveDestinationDescriptor {
  return {
    type: "primitive",
    insertionMode: getInsertionMode(target.anchor) ?? "to",
    target: upgradeRangeTarget(target),
  };
}

function primitiveTargetToDestination(
  target: PartialPrimitiveTargetDescriptorV5,
): PrimitiveDestinationDescriptor {
  return {
    type: "primitive",
    insertionMode: getInsertionMode(target) ?? "to",
    target: upgradePrimitiveTarget(target),
  };
}

function implicitTargetToDestination(): ImplicitDestinationDescriptor {
  return { type: "implicit" };
}

function getInsertionMode(
  target:
    | PartialPrimitiveTargetDescriptorV5
    | PartialRangeTargetDescriptorV5
    | ImplicitTargetDescriptor,
): InsertionMode | undefined {
  switch (target.type) {
    case "implicit":
      return "to";
    case "primitive":
      return getInsertionModeFromPrimitive(target);
    case "range":
      return getInsertionMode(target.anchor);
  }
}

function getInsertionModeFromPrimitive(
  target: PartialPrimitiveTargetDescriptorV5,
): InsertionMode | undefined {
  const positionModifier = target.modifiers?.find(
    (m): m is PositionModifierV5 => m.type === "position",
  );
  if (positionModifier != null) {
    if (target.modifiers!.indexOf(positionModifier) !== 0) {
      throw Error("Position modifier has to be at first index");
    }
    if (
      positionModifier?.position === "before" ||
      positionModifier?.position === "after"
    ) {
      return positionModifier.position;
    }
  }
  return undefined;
}

function getModifiers(modifiers?: ModifierV5[]): Modifier[] | undefined {
  const result: Modifier[] = [];

  if (modifiers != null) {
    for (const modifier of modifiers) {
      if (modifier.type === "position") {
        if (modifier.position === "start") {
          result.push({ type: "startOf" });
        } else if (modifier.position === "end") {
          result.push({ type: "endOf" });
        }
      } else {
        result.push(modifier as Modifier);
      }
    }
  }

  return result.length > 0 ? result : undefined;
}
