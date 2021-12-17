import {
  ActionPreferences,
  PartialPrimitiveTarget,
  PartialRangeTarget,
  PartialTarget,
  PrimitiveTarget,
  RangeTarget,
  Target,
  PartialListTarget,
} from "../typings/Types";

export default function (
  targets: PartialTarget[],
  actionPreferences: ActionPreferences[]
): Target[] {
  if (targets.length !== actionPreferences.length) {
    throw new Error("Target length is not equal to action preference length");
  }

  return targets.map((target, index) =>
    inferTarget(target, targets.slice(0, index), actionPreferences[index])
  );
}

function inferTarget(
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
    excludeAnchor: target.excludeStart ?? false,
    excludeActive: target.excludeEnd ?? false,
    rangeType: target.rangeType ?? "continuous",
    anchor: inferPrimitiveTarget(
      target.start,
      previousTargets,
      actionPreferences
    ),
    active: inferPrimitiveTarget(
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
  const doAttributeInference = !hasContent(target) && !target.isImplicit;

  const previousTargetsForAttributes = doAttributeInference
    ? previousTargets
    : [];

  const maybeSelectionType =
    target.selectionType ??
    getPreviousAttribute(previousTargetsForAttributes, "selectionType");

  const mark = target.mark ??
    (target.position === "before" || target.position === "after"
      ? getPreviousMark(previousTargets)
      : null) ?? {
      type: maybeSelectionType === "token" ? "cursorToken" : "cursor",
    };

  const position =
    target.position ??
    getPreviousPosition(previousTargets) ??
    actionPreferences.position ??
    "contents";

  const selectionType =
    maybeSelectionType ??
    (doAttributeInference ? actionPreferences.selectionType : null) ??
    "token";

  const insideOutsideType =
    target.insideOutsideType ??
    getPreviousAttribute(previousTargetsForAttributes, "insideOutsideType") ??
    actionPreferences.insideOutsideType;

  const modifier = target.modifier ??
    getPreviousAttribute(previousTargetsForAttributes, "modifier") ??
    (doAttributeInference ? actionPreferences.modifier : null) ?? {
      type: "identity",
    };

  return {
    type: target.type,
    mark,
    selectionType,
    position,
    insideOutsideType,
    modifier,
    isImplicit: target.isImplicit ?? false,
  };
}

function getPreviousMark(previousTargets: PartialTarget[]) {
  return getPreviousAttribute(
    previousTargets,
    "mark",
    (target) => target["mark"] != null
  );
}

function getPreviousPosition(previousTargets: PartialTarget[]) {
  return getPreviousAttribute(
    previousTargets,
    "position",
    (target) => target["position"] != null
  );
}

function getPreviousAttribute<T extends keyof PartialPrimitiveTarget>(
  previousTargets: PartialTarget[],
  attributeName: T,
  useTarget: (target: PartialPrimitiveTarget) => boolean = hasContent
) {
  const target = getPreviousTarget(previousTargets, useTarget);
  return target != null ? target[attributeName] : null;
}

function getPreviousTarget(
  previousTargets: PartialTarget[],
  useTarget: (target: PartialPrimitiveTarget) => boolean
): PartialPrimitiveTarget | null {
  // Search from back(last) to front(first)
  for (let i = previousTargets.length - 1; i > -1; --i) {
    const target = previousTargets[i];
    switch (target.type) {
      case "primitive":
        if (useTarget(target)) {
          return target;
        }
        break;
      case "range":
        if (useTarget(target.start)) {
          return target.start;
        }
        break;
      case "list":
        const result = getPreviousTarget(target.elements, useTarget);
        if (result != null) {
          return result;
        }
        break;
    }
  }
  return null;
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
