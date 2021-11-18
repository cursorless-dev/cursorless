import {
  PartialPrimitiveTarget,
  PartialRangeTarget,
  PartialTarget,
} from "../typings/Types";

/**
 * Given a list of targets, recursively descends all targets and returns every
 * contained primitive target.
 *
 * @param targets The targets to extract from
 * @returns A list of primitive targets
 */

export function getPrimitiveTargets(targets: PartialTarget[]) {
  return targets.flatMap(getPrimitiveTargetsHelper);
}
function getPrimitiveTargetsHelper(
  target: PartialTarget
): PartialPrimitiveTarget[] {
  switch (target.type) {
    case "primitive":
      return [target];
    case "list":
      return target.elements.flatMap(getPrimitiveTargetsHelper);
    case "range":
      return [target.start, target.end];
  }
}
/**
 * Given a list of targets, recursively descends all targets and applies `func`
 * to every primitive target.
 *
 * @param targets The targets to extract from
 * @returns A list of primitive targets
 */

export function transformPrimitiveTargets(
  targets: PartialTarget[],
  func: (target: PartialPrimitiveTarget) => PartialPrimitiveTarget
) {
  return targets.map((target) => transformPrimitiveTargetsHelper(target, func));
}
function transformPrimitiveTargetsHelper(
  target: PartialTarget,
  func: (target: PartialPrimitiveTarget) => PartialPrimitiveTarget
): PartialTarget {
  switch (target.type) {
    case "primitive":
      return func(target);
    case "list":
      return {
        ...target,
        elements: target.elements.map(
          (element) =>
            transformPrimitiveTargetsHelper(element, func) as
              | PartialPrimitiveTarget
              | PartialRangeTarget
        ),
      };
    case "range":
      return { ...target, start: func(target.start), end: func(target.end) };
  }
}
