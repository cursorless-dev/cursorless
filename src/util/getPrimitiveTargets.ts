import {
  PartialPrimitiveTarget,
  PartialRangeTarget,
  PartialTarget,
  PrimitiveTarget,
  Target,
} from "../typings/Types";

/**
 * Given a list of targets, recursively descends all targets and returns every
 * contained primitive target.
 *
 * @param targets The targets to extract from
 * @returns A list of primitive targets
 */
export function getPartialPrimitiveTargets(targets: PartialTarget[]) {
  return targets.flatMap(getPartialPrimitiveTargetsHelper);
}

function getPartialPrimitiveTargetsHelper(
  target: PartialTarget
): PartialPrimitiveTarget[] {
  switch (target.type) {
    case "primitive":
      return [target];
    case "list":
      return target.elements.flatMap(getPartialPrimitiveTargetsHelper);
    case "range":
      return [target.start, target.end];
  }
}
/**
 * Given a list of targets, recursively descends all targets and returns every
 * contained primitive target.
 *
 * @param targets The targets to extract from
 * @returns A list of primitive targets
 */
export function getPrimitiveTargets(targets: Target[]) {
  return targets.flatMap(getPrimitiveTargetsHelper);
}

function getPrimitiveTargetsHelper(target: Target): PrimitiveTarget[] {
  switch (target.type) {
    case "primitive":
      return [target];
    case "list":
      return target.elements.flatMap(getPrimitiveTargetsHelper);
    case "range":
      return [target.anchor, target.active];
  }
}

/**
 * Given a list of targets, recursively descends all targets and applies `func`
 * to every primitive target.
 *
 * @param targets The targets to extract from
 * @returns A list of primitive targets
 */
export function transformPartialPrimitiveTargets(
  targets: PartialTarget[],
  func: (target: PartialPrimitiveTarget) => PartialPrimitiveTarget
) {
  return targets.map((target) =>
    transformPartialPrimitiveTargetsHelper(target, func)
  );
}

function transformPartialPrimitiveTargetsHelper(
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
            transformPartialPrimitiveTargetsHelper(element, func) as
              | PartialPrimitiveTarget
              | PartialRangeTarget
        ),
      };
    case "range":
      return { ...target, start: func(target.start), end: func(target.end) };
  }
}
