import {
  ImplicitTargetDescriptor,
  PartialPrimitiveTargetDescriptor,
  PartialRangeTargetDescriptor,
  PartialTargetDescriptor,
} from "@cursorless/common";

/**
 * Given a list of targets, recursively descends all targets and returns every
 * contained primitive target.
 *
 * @param targets The targets to extract from
 * @returns A list of primitive targets
 */
export function getPartialPrimitiveTargets(targets: PartialTargetDescriptor[]) {
  return targets.flatMap(getPartialPrimitiveTargetsHelper);
}

function getPartialPrimitiveTargetsHelper(
  target: PartialTargetDescriptor,
): PartialPrimitiveTargetDescriptor[] {
  switch (target.type) {
    case "primitive":
      return [target];
    case "primitiveDestination":
      return [target.target];
    case "list":
      return target.elements.flatMap(getPartialPrimitiveTargetsHelper);
    case "range":
      return [target.anchor, target.active].flatMap(
        getPartialPrimitiveTargetsHelper,
      );
    case "rangeDestination":
      return [target.target.anchor, target.target.active].flatMap(
        getPartialPrimitiveTargetsHelper,
      );
    case "implicit":
      return [];
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
  targets: PartialTargetDescriptor[],
  func: (
    target: PartialPrimitiveTargetDescriptor,
  ) => PartialPrimitiveTargetDescriptor,
) {
  return targets.map((target) =>
    transformPartialPrimitiveTargetsHelper(target, func),
  );
}

function transformPartialPrimitiveTargetsHelper(
  target: PartialTargetDescriptor,
  func: (
    target: PartialPrimitiveTargetDescriptor,
  ) => PartialPrimitiveTargetDescriptor,
): PartialTargetDescriptor {
  switch (target.type) {
    case "primitive":
      return func(target);
    case "primitiveDestination":
      return { ...target, target: func(target.target) };
    case "implicit":
      return target;
    case "list":
      return {
        ...target,
        elements: target.elements.map(
          (element) =>
            transformPartialPrimitiveTargetsHelper(element, func) as
              | PartialPrimitiveTargetDescriptor
              | PartialRangeTargetDescriptor,
        ),
      };
    case "range":
      return {
        ...target,
        anchor: transformPartialPrimitiveTargetsHelper(target.anchor, func) as
          | PartialPrimitiveTargetDescriptor
          | ImplicitTargetDescriptor,
        active: func(target.active),
      };
    case "rangeDestination":
      return {
        ...target,
        target: {
          ...target.target,
          anchor: transformPartialPrimitiveTargetsHelper(
            target.target.anchor,
            func,
          ) as PartialPrimitiveTargetDescriptor | ImplicitTargetDescriptor,
          active: func(target.target.active),
        },
      };
  }
}
