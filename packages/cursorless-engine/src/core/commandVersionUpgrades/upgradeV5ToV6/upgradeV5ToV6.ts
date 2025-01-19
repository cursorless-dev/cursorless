import type {
  ActionCommandV5,
  CommandV5,
  CommandV6,
  DestinationDescriptor,
  EnforceUndefined,
  HighlightActionDescriptor,
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
import {
  type ExecuteCommandOptions,
  type GetTextActionOptions,
} from "@cursorless/common";
import canonicalizeActionName from "./canonicalizeActionName";

export function upgradeV5ToV6(command: CommandV5): EnforceUndefined<CommandV6> {
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
): EnforceUndefined<CommandV6["action"]> {
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
        snippetName: action.args?.[0] as string | undefined,
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
        options: action.args?.[1] as ExecuteCommandOptions | undefined,
        target: upgradeTarget(targets[0]),
      };
    case "replace":
      return {
        name,
        replaceWith: action.args![0] as ReplaceWith,
        destination: targetToDestination(targets[0]),
      };
    case "highlight": {
      const result: HighlightActionDescriptor = {
        name,
        target: upgradeTarget(targets[0]),
      };
      if (action.args?.[0] != null) {
        result.highlightId = action.args?.[0] as HighlightId;
      }
      return result;
    }
    case "editNew":
      return {
        name,
        destination: targetToDestination(targets[0]),
      };
    case "getText":
      return {
        name,
        options: action.args?.[0] as GetTextActionOptions | undefined,
        target: upgradeTarget(targets[0]),
      };
    case "parsed":
      throw Error("Parsed action should not be present in V5");
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
    case "range":
    case "primitive":
      return upgradeNonImplicitTarget(target);
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
    case "primitive":
      return upgradeRangeOrPrimitiveTarget(target);
  }
}

function upgradeListTarget(
  target: PartialListTargetDescriptorV5,
): PartialListTargetDescriptor {
  return {
    ...target,
    elements: target.elements.map(upgradeRangeOrPrimitiveTarget),
  };
}

function upgradeRangeOrPrimitiveTarget(
  target: PartialPrimitiveTargetDescriptorV5 | PartialRangeTargetDescriptorV5,
) {
  switch (target.type) {
    case "range":
      return upgradeRangeTarget(target);
    case "primitive":
      return upgradePrimitiveTarget(target);
  }
}

function upgradeRangeTarget(
  target: PartialRangeTargetDescriptorV5,
): PartialRangeTargetDescriptor {
  const { anchor, active } = target;
  const result: PartialRangeTargetDescriptor = {
    type: "range",
    anchor:
      anchor.type === "implicit" ? anchor : upgradePrimitiveTarget(anchor),
    active: upgradePrimitiveTarget(active),
    excludeAnchor: target.excludeAnchor,
    excludeActive: target.excludeActive,
  };
  if (target.rangeType != null) {
    result.rangeType = target.rangeType;
  }
  return result;
}

function upgradePrimitiveTarget(
  target: PartialPrimitiveTargetDescriptorV5,
): PartialPrimitiveTargetDescriptor {
  const result: PartialPrimitiveTargetDescriptor = {
    type: "primitive",
  };
  const modifiers = upgradeModifiers(target.modifiers);
  if (modifiers != null) {
    result.modifiers = modifiers;
  }
  if (target.mark != null) {
    result.mark = target.mark;
  }
  return result;
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

/**
 * Converts a list target to a destination. This is a bit tricky because we need
 * to split the list into multiple destinations if there is more than one insertion
 * mode.
 * @param target The target to convert
 * @returns The converted destination
 */
function listTargetToDestination(
  target: PartialListTargetDescriptorV5,
): DestinationDescriptor {
  const destinations: PrimitiveDestinationDescriptor[] = [];
  let currentElements: (
    | PartialPrimitiveTargetDescriptor
    | PartialRangeTargetDescriptor
  )[] = [];
  let currentInsertionMode: InsertionMode | undefined = undefined;

  const potentiallyAddDestination = () => {
    if (currentElements.length > 0) {
      destinations.push({
        type: "primitive",
        insertionMode: currentInsertionMode ?? "to",
        target:
          currentElements.length === 1
            ? currentElements[0]
            : {
                type: "list",
                elements: currentElements,
              },
      });
    }
  };

  target.elements.forEach((element) => {
    const insertionMode = getInsertionMode(element);

    if (insertionMode != null) {
      // If the insertion mode has changed, we need to create a new destination
      // with the elements and insertion mode seen so far
      potentiallyAddDestination();

      currentElements = [upgradeRangeOrPrimitiveTarget(element)];
      currentInsertionMode = insertionMode;
    } else {
      currentElements.push(upgradeRangeOrPrimitiveTarget(element));
    }
  });

  potentiallyAddDestination();

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
    // "start" and "end" modifiers don't affect insertion mode; they remain as
    // modifiers
  }
  return undefined;
}

function upgradeModifiers(modifiers?: ModifierV5[]): Modifier[] | undefined {
  const result: Modifier[] = [];

  if (modifiers != null) {
    for (const modifier of modifiers) {
      if (modifier.type === "position") {
        if (modifier.position === "start") {
          result.push({ type: "startOf" });
        } else if (modifier.position === "end") {
          result.push({ type: "endOf" });
        }

        // Drop "before" and "after" modifiers
      } else {
        result.push(modifier as Modifier);
      }
    }
  }

  return result.length > 0 ? result : undefined;
}
