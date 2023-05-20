import {
  EveryScopeModifier,
  ImplicitTargetDescriptor,
  Mark,
  Modifier,
  PartialListTargetDescriptor,
  PartialPrimitiveTargetDescriptor,
  PartialRangeTargetDescriptor,
  PartialTargetDescriptor,
  PositionModifier,
} from "@cursorless/common";
import {
  EveryRangeTargetDescriptor,
  PrimitiveTargetDescriptor,
  RangeTargetDescriptor,
  TargetDescriptor,
} from "../typings/TargetDescriptor";
import { findLastIndex } from "lodash";
import produce from "immer";

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
    case "primitive":
      return inferNonListTarget(target, previousTargets);
    case "implicit":
      return target;
  }
}

function inferListTarget(
  target: PartialListTargetDescriptor,
  previousTargets: PartialTargetDescriptor[],
): TargetDescriptor {
  return {
    ...target,
    elements: target.elements.map((element, index) =>
      inferNonListTarget(
        element,
        previousTargets.concat(target.elements.slice(0, index)),
      ),
    ),
  };
}

function inferNonListTarget(
  target: PartialPrimitiveTargetDescriptor | PartialRangeTargetDescriptor,
  previousTargets: PartialTargetDescriptor[],
): PrimitiveTargetDescriptor | RangeTargetDescriptor {
  switch (target.type) {
    case "primitive":
      return inferPrimitiveTarget(target, previousTargets);
    case "range":
      return inferRangeTarget(target, previousTargets);
  }
}

function inferRangeTarget(
  target: PartialRangeTargetDescriptor,
  previousTargets: PartialTargetDescriptor[],
): RangeTargetDescriptor {
  const fullTarget: RangeTargetDescriptor = {
    type: "range",
    rangeType: target.rangeType ?? "continuous",
    excludeAnchor: target.excludeAnchor ?? false,
    excludeActive: target.excludeActive ?? false,
    anchor: inferPossiblyImplicitTarget(target.anchor, previousTargets),
    active: inferPrimitiveTarget(
      target.active,
      previousTargets.concat(target.anchor),
    ),
  };

  const isAnchorMarkImplicit =
    target.anchor.type === "implicit" || target.anchor.mark == null;

  return handleEveryRangeTarget(fullTarget, isAnchorMarkImplicit) ?? fullTarget;
}

/**
 * This function exists to enable constructs like "every line air past bat".
 * When we detect a range target which has an `everyScope` modifier on its
 * anchor, we do the following:
 *
 * 1. Split the anchor's modifier chain, so that everything after the
 *    `everyScope` modifier remains on the anchor, and we reserve everything
 *    that comes before the `everyScope` modifier.
 * 2. We construct a special "every" range target that we handle specially in
 *    {@link TargetPipeline.processEveryRangeTarget}.
 * 3. We put the reserved modifiers on the "every" range target to be applied
 *    after we've handled the "every" range target.
 * 4. We remove everything before and including the `everyScope` modifier from
 *    the active target.
 *
 * We effectively break the chain into two parts, one that is applied before
 * handling the "every" range target, and one that is applied after.  For
 * example:
 *
 * ```
 * "first token every line funk air past bat"
 * ```
 *
 * In this case, we create an "every" range target with anchor `"funk air"` and
 * active `"funk bat"`.  We then apply the modifier `"first token"` to the
 * resulting range.
 *
 * @param fullTarget The full range target, post-inference
 * @param isAnchorMarkImplicit `true` if the anchor mark was implicit on the
 * original partial target
 */
function handleEveryRangeTarget(
  fullTarget: RangeTargetDescriptor,
  isAnchorMarkImplicit: boolean,
): EveryRangeTargetDescriptor | null {
  const { anchor, rangeType, active, excludeAnchor, excludeActive } =
    fullTarget;

  if (anchor.type !== "primitive" || rangeType !== "continuous") {
    return null;
  }

  const everyScopeModifierIndex = findLastIndex(
    anchor.modifiers,
    ({ type }) => type === "everyScope",
  );

  if (everyScopeModifierIndex === -1) {
    return null;
  }

  const scopeType = (
    anchor.modifiers[everyScopeModifierIndex] as EveryScopeModifier
  ).scopeType;

  const [beforeEveryModifiers, afterEveryModifiers] = [
    anchor.modifiers.slice(0, everyScopeModifierIndex),
    anchor.modifiers.slice(everyScopeModifierIndex + 1),
  ];

  return {
    type: "range",
    rangeType: "every",
    scopeType,
    anchor:
      // If they say "every line past bat", the anchor is implicit, even though
      // it comes across the wire as a primitive target due to the "every line",
      // which we've now removed
      afterEveryModifiers.length === 0 && isAnchorMarkImplicit
        ? { type: "implicit" }
        : {
            type: "primitive",
            mark: anchor.mark,
            positionModifier: undefined,
            modifiers: afterEveryModifiers,
          },
    // Remove the "every" (and everything before it) from the active if it
    // ended up there from inference
    active: produce(active, (draft) => {
      draft.modifiers = draft.modifiers.slice(
        findLastIndex(
          draft.modifiers,
          (modifier) => modifier.type === "everyScope",
        ) + 1,
      );
    }),
    modifiers: beforeEveryModifiers,
    positionModifier: anchor.positionModifier,
    excludeAnchor,
    excludeActive,
  };
}

function inferPossiblyImplicitTarget(
  target: PartialPrimitiveTargetDescriptor | ImplicitTargetDescriptor,
  previousTargets: PartialTargetDescriptor[],
): PrimitiveTargetDescriptor | ImplicitTargetDescriptor {
  if (target.type === "implicit") {
    return target;
  }

  return inferPrimitiveTarget(target, previousTargets);
}

function inferPrimitiveTarget(
  target: PartialPrimitiveTargetDescriptor,
  previousTargets: PartialTargetDescriptor[],
): PrimitiveTargetDescriptor {
  const ownPositionModifier = getPositionModifier(target);
  const ownModifiers = getPreservedModifiers(target);

  const mark =
    target.mark ??
    (shouldInferPreviousMark(target)
      ? getPreviousMark(previousTargets)
      : null) ??
    undefined;

  const modifiers =
    ownModifiers ?? getPreviousPreservedModifiers(previousTargets) ?? [];

  const positionModifier =
    ownPositionModifier ?? getPreviousPositionModifier(previousTargets);

  return {
    type: target.type,
    mark,
    modifiers,
    positionModifier,
  };
}

function getPositionModifier(
  target: PartialPrimitiveTargetDescriptor,
): PositionModifier | undefined {
  if (target.modifiers == null) {
    return undefined;
  }

  const positionModifierIndex = target.modifiers.findIndex(
    (modifier) => modifier.type === "position",
  );

  if (positionModifierIndex > 0) {
    throw Error("Position modifiers must be at the start of a modifier chain");
  }

  return positionModifierIndex === -1
    ? undefined
    : (target.modifiers[positionModifierIndex] as PositionModifier);
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
      (modifier) => !["position", "inferPreviousMark"].includes(modifier.type),
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

function getPreviousPositionModifier(
  previousTargets: PartialTargetDescriptor[],
): PositionModifier | undefined {
  return getPreviousTargetAttribute(previousTargets, getPositionModifier);
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
        const attributeValue = getAttribute(target);
        if (attributeValue != null) {
          return attributeValue;
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
