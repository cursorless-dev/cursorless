import {
  ActionCommandV5,
  CommandV5,
  CommandV6,
  ExecuteCommandOptions,
  HighlightId,
  ImplicitTargetDescriptor,
  InsertSnippetArg,
  InsertionMode,
  Modifier,
  ModifierV5,
  PartialActionDescriptor,
  PartialDestinationDescriptor,
  PartialListDestinationDescriptor,
  PartialListTargetDescriptor,
  PartialListTargetDescriptorV5,
  PartialPrimitiveDestinationDescriptor,
  PartialPrimitiveTargetDescriptor,
  PartialPrimitiveTargetDescriptorV5,
  PartialRangeTargetDescriptor,
  PartialRangeTargetDescriptorV5,
  PartialTargetDescriptor,
  PartialTargetDescriptorV5,
  PositionModifierV5,
  ReplaceWith,
  WrapWithSnippetArg,
} from "@cursorless/common";

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
): PartialActionDescriptor {
  switch (action.name) {
    case "replaceWithTarget":
    case "moveToTarget":
      return {
        name: action.name,
        source: upgradeTarget(targets[0]),
        destination: targetToDestination(targets[1]),
      };
    case "swapTargets":
      return {
        name: action.name,
        target1: upgradeTarget(targets[0]),
        target2: upgradeTarget(targets[1]),
      };
    case "callAsFunction":
      return {
        name: action.name,
        callee: upgradeTarget(targets[0]),
        args: upgradeTarget(targets[1]),
      };
    case "pasteFromClipboard":
      return {
        name: action.name,
        destination: targetToDestination(targets[0]),
      };
    case "wrapWithPairedDelimiter":
    case "rewrapWithPairedDelimiter":
      return {
        name: action.name,
        left: action.args![0] as string,
        right: action.args![1] as string,
        target: upgradeTarget(targets[0]),
      };
    case "generateSnippet":
      return {
        name: action.name,
        snippetName: action.args?.[0] as string,
        target: upgradeTarget(targets[0]),
      };
    case "insertSnippet":
      return {
        name: action.name,
        snippetDescription: action.args![0] as InsertSnippetArg,
        destination: targetToDestination(targets[0]),
      };
    case "wrapWithSnippet":
      return {
        name: action.name,
        snippetDescription: action.args![0] as WrapWithSnippetArg,
        target: upgradeTarget(targets[0]),
      };
    case "executeCommand":
      return {
        name: action.name,
        commandId: action.args![0] as string,
        options: action.args?.[1] as ExecuteCommandOptions,
        target: upgradeTarget(targets[0]),
      };
    case "replace":
      return {
        name: action.name,
        replaceWith: action.args![0] as ReplaceWith,
        destination: targetToDestination(targets[0]),
      };
    case "highlight":
      return {
        name: action.name,
        highlightId: action.args?.[0] as HighlightId,
        target: upgradeTarget(targets[0]),
      };
    default:
      return {
        name: action.name,
        target: upgradeTarget(targets[0]),
      } as PartialActionDescriptor; // TODO:
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
): PartialDestinationDescriptor {
  switch (target.type) {
    case "list":
      return listTargetToDestination(target);
    case "range":
      return rangeTargetToDestination(target);
    case "primitive":
      return primitiveTargetToDestination(target);
    case "implicit":
      return implicitTargetToDestination(target);
  }
}

function listTargetToDestination(
  target: PartialListTargetDescriptorV5,
): PartialDestinationDescriptor {
  const destinations: PartialPrimitiveDestinationDescriptor[] = [];
  target.elements.forEach((element) => {
    const insertionMode = getInsertionMode(element);
    if (insertionMode != null || destinations.length === 0) {
      destinations.push({
        type: "destination",
        insertionMode: insertionMode ?? "to",
        target: upgradeTarget(element),
      });
    } else {
      destinations.push({
        type: "destination",
        insertionMode: destinations[destinations.length - 1].insertionMode,
        target: upgradeTarget(element),
      });
    }
  });
  if (destinations.length > 1) {
    return {
      type: "destinationList",
      destinations,
    } as PartialListDestinationDescriptor;
  }
  return destinations[0];
}

function rangeTargetToDestination(
  target: PartialRangeTargetDescriptorV5,
): PartialPrimitiveDestinationDescriptor {
  return {
    type: "destination",
    insertionMode: getInsertionMode(target.anchor) ?? "to",
    target: upgradeRangeTarget(target),
  };
}

function primitiveTargetToDestination(
  target: PartialPrimitiveTargetDescriptorV5,
): PartialPrimitiveDestinationDescriptor {
  return {
    type: "destination",
    insertionMode: getInsertionMode(target) ?? "to",
    target: upgradePrimitiveTarget(target),
  };
}

function implicitTargetToDestination(
  target: ImplicitTargetDescriptor,
): PartialPrimitiveDestinationDescriptor {
  return {
    type: "destination",
    insertionMode: "to",
    target,
  };
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
