import {
  PartialListTargetDesc,
  PartialPrimitiveTargetDesc,
  PartialRangeTargetDesc,
  PartialTargetDesc,
  PrimitiveTargetDesc,
  RangeTargetDesc,
  TargetDesc,
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
  actionPreferences: ActionPreferences[]
): TargetDesc[] {
  // TODO
  // if (targets.length !== actionPreferences.length) {
  //   throw new Error("Target length is not equal to action preference length");
  // }

  return targets.map((target, index) =>
    inferTarget(target, targets.slice(0, index), actionPreferences[index])
  );
}

function inferTarget(
  target: PartialTargetDesc,
  previousTargets: PartialTargetDesc[],
  actionPreferences: ActionPreferences
): TargetDesc {
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
  actionPreferences: ActionPreferences
): TargetDesc {
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
  actionPreferences: ActionPreferences
): PrimitiveTargetDesc | RangeTargetDesc {
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
  actionPreferences: ActionPreferences
): RangeTargetDesc {
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
  // TODO ActionPreferences
  actionPreferences: ActionPreferences
): PrimitiveTargetDesc {
  const hasPosition = !!target.modifiers?.find(
    (modifier) => modifier.type === "position"
  );

  // Position without a mark can be something like "take air past end of line"
  const mark = target.mark ??
    (hasPosition ? getPreviousAttribute(previousTargets, "mark") : null) ?? {
      type: "cursor",
    };

  const modifiers =
    target.modifiers ??
    getPreviousAttribute(previousTargets, "modifiers") ??
    [];

  return {
    type: target.type,
    mark,
    modifiers,
  };
}

function getPreviousAttribute<T extends keyof PartialPrimitiveTargetDesc>(
  previousTargets: PartialTargetDesc[],
  attributeName: T
) {
  const target = getPreviousTarget(
    previousTargets,
    (target: PartialPrimitiveTargetDesc) => !!target[attributeName]
  );
  return target != null ? target[attributeName] : null;
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
