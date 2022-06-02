import {
  PartialPrimitiveTargetDesc,
  PartialRangeTargetDesc,
  PartialTargetDesc,
  PrimitiveTargetDescriptor,
  TargetDescriptor
} from "../typings/targetDescriptor.types";

/**
 * Given a list of targets, recursively descends all targets and returns every
 * contained primitive target.
 *
 * @param targets The targets to extract from
 * @returns A list of primitive targets
 */
export function getPartialPrimitiveTargets(targets: PartialTargetDesc[]) {
  return targets.flatMap(getPartialPrimitiveTargetsHelper);
}

function getPartialPrimitiveTargetsHelper(
  target: PartialTargetDesc
): PartialPrimitiveTargetDesc[] {
  switch (target.type) {
    case "primitive":
      return [target];
    case "list":
      return target.elements.flatMap(getPartialPrimitiveTargetsHelper);
    case "range":
      return [target.anchor, target.active];
  }
}
/**
 * Given a list of targets, recursively descends all targets and returns every
 * contained primitive target.
 *
 * @param targets The targets to extract from
 * @returns A list of primitive targets
 */
export function getPrimitiveTargets(targets: TargetDescriptor[]) {
  return targets.flatMap(getPrimitiveTargetsHelper);
}

function getPrimitiveTargetsHelper(
  target: TargetDescriptor
): PrimitiveTargetDescriptor[] {
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
  targets: PartialTargetDesc[],
  func: (target: PartialPrimitiveTargetDesc) => PartialPrimitiveTargetDesc
) {
  return targets.map((target) =>
    transformPartialPrimitiveTargetsHelper(target, func)
  );
}

function transformPartialPrimitiveTargetsHelper(
  target: PartialTargetDesc,
  func: (target: PartialPrimitiveTargetDesc) => PartialPrimitiveTargetDesc
): PartialTargetDesc {
  switch (target.type) {
    case "primitive":
      return func(target);
    case "list":
      return {
        ...target,
        elements: target.elements.map(
          (element) =>
            transformPartialPrimitiveTargetsHelper(element, func) as
              | PartialPrimitiveTargetDesc
              | PartialRangeTargetDesc
        ),
      };
    case "range":
      return {
        ...target,
        anchor: func(target.anchor),
        active: func(target.active),
      };
  }
}
