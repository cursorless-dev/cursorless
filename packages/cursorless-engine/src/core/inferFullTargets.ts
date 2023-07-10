import {
  Modifier,
  PartialListTargetDescriptor,
  PartialPrimitiveTargetDescriptor,
  PartialRangeTargetDescriptor,
  PartialTargetDescriptor,
} from "@cursorless/common";
import {
  ListTargetDescriptor,
  Mark,
  PrimitiveTargetDescriptor,
  RangeTargetDescriptor,
  TargetDescriptor,
} from "../typings/TargetDescriptor";
import { handleHoistedModifiers } from "./handleHoistedModifiers";

/**
 * Performs inference on the partial targets provided by the user, using
 * previous targets, global defaults, and action-specific defaults to fill out
 * any details that may have been omitted in the spoken form.
 * For example, we would automatically infer that `"take funk air and bat"` is
 * equivalent to `"take funk air and funk bat"`.
 * @param targets The partial targets which need to be completed by inference.
 * @returns Target objects fully filled out and ready to be processed by {@link processTargets}.
 */
export default function inferFullTargetDescriptors(
  targets: PartialTargetDescriptor[],
): TargetDescriptor[] {
  return targets.map((target, index) =>
    inferTarget(target, targets.slice(0, index)),
  );
}

function inferTarget(
  target: PartialTargetDescriptor,
  previousTargets: PartialTargetDescriptor[],
): TargetDescriptor {
  switch (target.type) {
    case "list":
      return inferListTarget(target, previousTargets);
    case "range":
      return inferRangeTarget(target, previousTargets);
    case "primitive":
      return inferPrimitiveTarget(target, previousTargets);
    case "implicit":
      return target;
  }
}

function inferListTarget(
  target: PartialListTargetDescriptor,
  previousTargets: PartialTargetDescriptor[],
): ListTargetDescriptor {
  return {
    ...target,
    elements: target.elements.map((element, index) => {
      const elementPreviousTargets = previousTargets.concat(
        target.elements.slice(0, index),
      );
      switch (element.type) {
        case "range":
          return inferRangeTargetWithHoist(element, elementPreviousTargets);
        case "primitive":
          return inferPrimitiveTarget(element, elementPreviousTargets);
      }
    }),
  };
}

function inferRangeTargetWithHoist(
  target: PartialRangeTargetDescriptor,
  previousTargets: PartialTargetDescriptor[],
): RangeTargetDescriptor | PrimitiveTargetDescriptor {
  const fullTarget = inferRangeTarget(target, previousTargets);

  const isAnchorMarkImplicit =
    target.anchor.type === "implicit" || target.anchor.mark == null;

  return handleHoistedModifiers(fullTarget, isAnchorMarkImplicit);
}

function inferRangeTarget(
  target: PartialRangeTargetDescriptor,
  previousTargets: PartialTargetDescriptor[],
): RangeTargetDescriptor {
  return {
    type: "range",
    rangeType: target.rangeType ?? "continuous",
    excludeAnchor: target.excludeAnchor ?? false,
    excludeActive: target.excludeActive ?? false,
    anchor:
      target.anchor.type === "implicit"
        ? target.anchor
        : inferPrimitiveTarget(target.anchor, previousTargets),
    active: inferPrimitiveTarget(
      target.active,
      previousTargets.concat(target.anchor),
    ),
  };
}

function inferPrimitiveTarget(
  target: PartialPrimitiveTargetDescriptor,
  previousTargets: PartialTargetDescriptor[],
): PrimitiveTargetDescriptor {
  const mark = target.mark ??
    (shouldInferPreviousMark(target)
      ? getPreviousMark(previousTargets)
      : null) ?? {
      type: "cursor",
    };

  const modifiers =
    getPreservedModifiers(target) ??
    getPreviousPreservedModifiers(previousTargets) ??
    [];

  return {
    type: target.type,
    mark,
    modifiers,
  };
}

function shouldInferPreviousMark(
  target: PartialPrimitiveTargetDescriptor,
): boolean {
  return target.modifiers?.some((m) => m.type === "inferPreviousMark") ?? false;
}

/**
 * Return a list of modifiers that should not be removed during inference.
 * Today, we remove positional modifiers, because they have their own field on
 * the full targets.  We also remove modifiers that only impact inference, such
 * as `inferPreviousMark`.
 *
 * We return `undefined` if there are no preserved modifiers. Note that we will
 * never return an empty list; we will always return `undefined` if there are no
 * preserved modifiers.
 * @param target The target from which to get the modifiers
 * @returns A list of preserved modifiers or `undefined` if there are none
 */
function getPreservedModifiers(
  target: PartialPrimitiveTargetDescriptor,
): Modifier[] | undefined {
  const preservedModifiers =
    target.modifiers?.filter(
      (modifier) => !["inferPreviousMark"].includes(modifier.type),
    ) ?? [];
  if (preservedModifiers.length !== 0) {
    return preservedModifiers;
  }
  // In the absence of any other modifiers line number marks are infer as a containing line scope
  if (isLineNumberMark(target)) {
    return [
      {
        type: "containingScope",
        scopeType: {
          type: "line",
        },
      },
    ];
  }
  return undefined;
}

/**
 * Returns true if this target has a line number mark.
 * @param target The target to check for line number mark
 * @returns True if this target has a line number mark
 */
function isLineNumberMark(target: PartialPrimitiveTargetDescriptor): boolean {
  const isLineNumber = (mark?: Mark) => mark?.type === "lineNumber";
  if (isLineNumber(target.mark)) {
    return true;
  }
  if (target.mark?.type === "range") {
    return isLineNumber(target.mark.anchor) && isLineNumber(target.mark.active);
  }
  return false;
}

function getPreviousMark(
  previousTargets: PartialTargetDescriptor[],
): Mark | undefined {
  return getPreviousTargetAttribute(
    previousTargets,
    (target: PartialPrimitiveTargetDescriptor) => target.mark,
  );
}

function getPreviousPreservedModifiers(
  previousTargets: PartialTargetDescriptor[],
): Modifier[] | undefined {
  return getPreviousTargetAttribute(previousTargets, getPreservedModifiers);
}

/**
 * Walks backward through the given targets and their descendants trying to find
 * the first target for which the given attribute extractor returns a
 * non-nullish value. Returns `undefined` if none could be found
 * @param previousTargets The targets that precede the target we are trying to
 * infer. We look in these targets and their descendants for the given attribute
 * @param getAttribute The function used to extract the attribute from a
 * primitive target
 * @returns The extracted attribute or undefined if one could not be found
 */
function getPreviousTargetAttribute<T>(
  previousTargets: PartialTargetDescriptor[],
  getAttribute: (target: PartialPrimitiveTargetDescriptor) => T | undefined,
): T | undefined {
  // Search from back(last) to front(first)
  for (let i = previousTargets.length - 1; i > -1; --i) {
    const target = previousTargets[i];
    switch (target.type) {
      case "primitive": {
        if (getAttribute != null) {
          const attributeValue = getAttribute(target);
          if (attributeValue != null) {
            return attributeValue;
          }
        }
        break;
      }
      case "range": {
        const attributeValue = getPreviousTargetAttribute(
          [target.anchor],
          getAttribute,
        );
        if (attributeValue != null) {
          return attributeValue;
        }
        break;
      }
      case "list": {
        const attributeValue = getPreviousTargetAttribute(
          target.elements,
          getAttribute,
        );
        if (attributeValue != null) {
          return attributeValue;
        }
        break;
      }
    }
  }
  return undefined;
}
