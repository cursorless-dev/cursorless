import {
  Modifier,
  PartialListTargetDesc,
  PartialPrimitiveTargetDesc,
  PartialRangeTargetDesc,
  PartialTargetDesc,
  PrimitiveTargetDescriptor,
  RangeTargetDescriptor,
  TargetDescriptor,
} from "../typings/target.types";
import { ActionPreferences } from "../typings/Types";

/**
 * Performs inference on the partial targets provided by the user, using
 * previous targets, global defaults, and action-specific defaults to fill out
 * any details that may have been omitted in the spoken form.
 * For example, we would automatically infer that `"take funk air and bat"` is
 * equivalent to `"take funk air and funk bat"`.
 * @param targets The partial targets which need to be completed by inference.
 * @param actionPreferences The preferences provided by the action, so that different actions can provide their own defaults
 * @returns Target objects fully filled out and ready to be processed by {@link processTargets}.
 */
export default function inferFullTargets(
  targets: PartialTargetDesc[],
  actionPreferences?: ActionPreferences[]
): TargetDescriptor[] {
  if (
    actionPreferences != null &&
    targets.length !== actionPreferences.length
  ) {
    throw new Error("Target length is not equal to action preference length");
  }

  return targets.map((target, index) =>
    inferTarget(target, targets.slice(0, index), actionPreferences?.at(index))
  );
}

function inferTarget(
  target: PartialTargetDesc,
  previousTargets: PartialTargetDesc[],
  actionPreferences?: ActionPreferences
): TargetDescriptor {
  switch (target.type) {
    case "list":
      return inferListTarget(target, previousTargets, actionPreferences);
    case "range":
    case "primitive":
      return inferNonListTarget(target, previousTargets, actionPreferences);
  }
}

function inferListTarget(
  target: PartialListTargetDesc,
  previousTargets: PartialTargetDesc[],
  actionPreferences?: ActionPreferences
): TargetDescriptor {
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
  target: PartialPrimitiveTargetDesc | PartialRangeTargetDesc,
  previousTargets: PartialTargetDesc[],
  actionPreferences?: ActionPreferences
): PrimitiveTargetDescriptor | RangeTargetDescriptor {
  switch (target.type) {
    case "primitive":
      return inferPrimitiveTarget(target, previousTargets, actionPreferences);
    case "range":
      return inferRangeTarget(target, previousTargets, actionPreferences);
  }
}

function inferRangeTarget(
  target: PartialRangeTargetDesc,
  previousTargets: PartialTargetDesc[],
  actionPreferences?: ActionPreferences
): RangeTargetDescriptor {
  return {
    type: "range",
    excludeAnchor: target.excludeStart ?? false,
    excludeActive: target.excludeEnd ?? false,
    rangeType: target.rangeType ?? "continuous",
    anchor: inferPrimitiveTarget(
      target.anchor,
      previousTargets,
      actionPreferences
    ),
    active: inferPrimitiveTarget(
      target.active,
      previousTargets.concat(target.anchor),
      actionPreferences
    ),
  };
}

function inferPrimitiveTarget(
  target: PartialPrimitiveTargetDesc,
  previousTargets: PartialTargetDesc[],
  actionPreferences?: ActionPreferences
): PrimitiveTargetDescriptor {
  const hasPosition = !!target.modifiers?.find(
    (modifier) => modifier.type === "position"
  );

  // Position without a mark can be something like "take air past end of line"
  const mark = target.mark ??
    (hasPosition ? getPreviousMark(previousTargets) : null) ?? {
      type: "cursor",
    };

  const previousModifiers = getPreviousModifiers(previousTargets);
  const implicitModifiers = target.isImplicit
    ? [{ type: "toRawSelection" } as Modifier]
    : undefined;

  const modifiers =
    target.modifiers != null
      ? target.modifiers
      : implicitModifiers ??
        previousModifiers ??
        actionPreferences?.modifiers ??
        [];

  // TODO Is this really a good solution?
  // "bring line to after this" needs to infer line on second target
  const modifierTypes = [
    ...new Set(modifiers.map((modifier) => modifier.type)),
  ];
  if (
    previousModifiers != null &&
    modifierTypes.length === 1 &&
    modifierTypes[0] === "position"
  ) {
    const containingScopeModifier = previousModifiers.find(
      (modifier) => modifier.type === "containingScope"
    );
    if (containingScopeModifier != null) {
      modifiers.push(containingScopeModifier);
    }
  }

  return {
    type: target.type,
    mark,
    modifiers,
  };
}

function getPreviousMark(previousTargets: PartialTargetDesc[]) {
  return getPreviousTarget(
    previousTargets,
    (target: PartialPrimitiveTargetDesc) => target.mark != null
  )?.mark;
}

function getPreviousModifiers(previousTargets: PartialTargetDesc[]) {
  return getPreviousTarget(
    previousTargets,
    (target: PartialPrimitiveTargetDesc) => target.modifiers != null
  )?.modifiers;
}

function getPreviousTarget(
  previousTargets: PartialTargetDesc[],
  useTarget: (target: PartialPrimitiveTargetDesc) => boolean
): PartialPrimitiveTargetDesc | null {
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
        if (useTarget(target.anchor)) {
          return target.anchor;
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
