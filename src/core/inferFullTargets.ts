import {
  PartialListTargetDesc,
  PartialPrimitiveTargetDesc,
  PartialRangeTargetDesc,
  PartialTargetDesc,
  PrimitiveTargetDescriptor,
  RangeTargetDescriptor,
  TargetDescriptor
} from "../typings/targetDescriptor.types";

/**
 * Performs inference on the partial targets provided by the user, using
 * previous targets, global defaults, and action-specific defaults to fill out
 * any details that may have been omitted in the spoken form.
 * For example, we would automatically infer that `"take funk air and bat"` is
 * equivalent to `"take funk air and funk bat"`.
 * @param targets The partial targets which need to be completed by inference.
 * @returns Target objects fully filled out and ready to be processed by {@link processTargets}.
 */
export default function inferFullTargets(
  targets: PartialTargetDesc[]
): TargetDescriptor[] {
  return targets.map((target, index) =>
    inferTarget(target, targets.slice(0, index))
  );
}

function inferTarget(
  target: PartialTargetDesc,
  previousTargets: PartialTargetDesc[]
): TargetDescriptor {
  switch (target.type) {
    case "list":
      return inferListTarget(target, previousTargets);
    case "range":
    case "primitive":
      return inferNonListTarget(target, previousTargets);
  }
}

function inferListTarget(
  target: PartialListTargetDesc,
  previousTargets: PartialTargetDesc[]
): TargetDescriptor {
  return {
    ...target,
    elements: target.elements.map((element, index) =>
      inferNonListTarget(
        element,
        previousTargets.concat(target.elements.slice(0, index))
      )
    ),
  };
}

function inferNonListTarget(
  target: PartialPrimitiveTargetDesc | PartialRangeTargetDesc,
  previousTargets: PartialTargetDesc[]
): PrimitiveTargetDescriptor | RangeTargetDescriptor {
  switch (target.type) {
    case "primitive":
      return inferPrimitiveTarget(target, previousTargets);
    case "range":
      return inferRangeTarget(target, previousTargets);
  }
}

function inferRangeTarget(
  target: PartialRangeTargetDesc,
  previousTargets: PartialTargetDesc[]
): RangeTargetDescriptor {
  return {
    type: "range",
    excludeAnchor: target.excludeAnchor ?? false,
    excludeActive: target.excludeActive ?? false,
    rangeType: target.rangeType ?? "continuous",
    anchor: inferPrimitiveTarget(target.anchor, previousTargets),
    active: inferPrimitiveTarget(
      target.active,
      previousTargets.concat(target.anchor)
    ),
  };
}

function inferPrimitiveTarget(
  target: PartialPrimitiveTargetDesc,
  previousTargets: PartialTargetDesc[]
): PrimitiveTargetDescriptor {
  if (target.isImplicit) {
    return {
      type: "primitive",
      mark: { type: "cursor" },
      modifiers: [{ type: "toRawSelection" }],
    };
  }

  const hasPosition = !!target.modifiers?.find(
    (modifier) => modifier.type === "position"
  );

  // Position without a mark can be something like "take air past end of line"
  const mark = target.mark ??
    (hasPosition ? getPreviousMark(previousTargets) : null) ?? {
      type: "cursor",
    };

  const previousModifiers = getPreviousModifiers(previousTargets);

  const modifiers = target.modifiers ?? previousModifiers ?? [];

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
