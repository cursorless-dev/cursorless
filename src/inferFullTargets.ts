import {
  ActionPreferences,
  PartialPrimitiveTarget,
  PartialRangeTarget,
  PartialTarget,
  PrimitiveTarget,
  RangeTarget,
  Target,
  PartialListTarget,
} from "./Types";

export function inferFullTargets(
  targets: PartialTarget[],
  actionPreferences: ActionPreferences[]
): Target[] {
  if (targets.length !== actionPreferences.length) {
    throw new Error("Target length is not equal to action preference length");
  }
  return targets.map((target, index) =>
    inferSingleTarget(target, targets.slice(0, index), actionPreferences[index])
  );
}

export function inferSingleTarget(
  target: PartialTarget,
  previousTargets: PartialTarget[],
  actionPreferences: ActionPreferences
): Target {
  switch (target.type) {
    case "list":
      return inferListTarget(target, previousTargets, actionPreferences);
    case "range":
    case "primitive":
      return inferNonListTarget(target, previousTargets, actionPreferences);
  }
}

function inferListTarget(
  target: PartialListTarget,
  previousTargets: PartialTarget[],
  actionPreferences: ActionPreferences
): Target {
  return {
    ...target,
    elements: target.elements.map((element, index) =>
      inferNonListTarget(
        element,
        previousTargets.concat(target.elements.slice(0, index)),
        actionPreferences
      )
    ),
  };
}

function inferNonListTarget(
  target: PartialPrimitiveTarget | PartialRangeTarget,
  previousTargets: PartialTarget[],
  actionPreferences: ActionPreferences
): PrimitiveTarget | RangeTarget {
  switch (target.type) {
    case "primitive":
      return inferPrimitiveTarget(target, previousTargets, actionPreferences);
    case "range":
      return inferRangeTarget(target, previousTargets, actionPreferences);
  }
}

function inferRangeTarget(
  target: PartialRangeTarget,
  previousTargets: PartialTarget[],
  actionPreferences: ActionPreferences
): RangeTarget {
  return {
    type: "range",
    excludeStart: target.excludeStart ?? false,
    excludeEnd: target.excludeEnd ?? false,
    start: inferPrimitiveTarget(
      target.start,
      previousTargets,
      actionPreferences
    ),
    end: inferPrimitiveTarget(
      target.end,
      previousTargets.concat(target.start),
      actionPreferences
    ),
  };
}

function inferPrimitiveTarget(
  target: PartialPrimitiveTarget,
  previousTargets: PartialTarget[],
  actionPreferences: ActionPreferences
): PrimitiveTarget {
  const previousTargetsToUse = hasContent(target) ? [] : previousTargets;

  const maybeSelectionType =
    target.selectionType ??
    extractAttributeFromPreviousTargets(previousTargetsToUse, "selectionType");

  const mark = target.mark ??
    extractAttributeFromPreviousTargets(previousTargets, "mark") ?? {
      type: maybeSelectionType === "token" ? "cursorToken" : "cursor",
    };

  const selectionType = maybeSelectionType ?? "token";

  const position =
    target.position ??
    extractAttributeFromPreviousTargets(previousTargetsToUse, "position") ??
    "contents";

  const modifier = target.modifier ??
    extractAttributeFromPreviousTargets(previousTargetsToUse, "modifier") ?? {
      type: "identity",
    };

  const insideOutsideType =
    target.insideOutsideType ??
    extractAttributeFromPreviousTargets(previousTargetsToUse, "insideOutsideType") ??
    actionPreferences.insideOutsideType;

  return {
    type: target.type,
    mark,
    selectionType,
    position,
    modifier,
    insideOutsideType,
  };
}

function extractAttributeFromPreviousTargets<
  T extends keyof PartialPrimitiveTarget
>(
  previousTargets: PartialTarget[],
  attributeName: T
): PartialPrimitiveTarget[T] | null {
  // Search from back(last) to front(first)
  for (let i = previousTargets.length - 1; i > -1; --i) {
    const attribute = extractAttribute(previousTargets[i], attributeName);
    if (attribute != null) {
      return attribute;
    }
  }
  return null;
}

function extractAttribute<T extends keyof PartialPrimitiveTarget>(
  target: PartialTarget,
  attributeName: T
): PartialPrimitiveTarget[T] | null {
  switch (target.type) {
    case "primitive":
      return target[attributeName];
    case "range":
      return (
        extractAttribute(target.end, attributeName) ??
        extractAttribute(target.start, attributeName)
      );
    case "list":
      return extractAttributeFromPreviousTargets(
        target.elements,
        attributeName
      );
  }
}

/**
 * Determine whether the target has content, so that we shouldn't do inference
 * @param target The target to inspect
 * @returns A boolean indicating whether the target has content
 */
function hasContent(target: PartialPrimitiveTarget) {
  return (
    target.selectionType != null ||
    target.modifier != null ||
    target.insideOutsideType != null
  );
}
