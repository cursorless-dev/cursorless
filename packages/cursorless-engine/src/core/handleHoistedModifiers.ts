import { Modifier } from "@cursorless/common";
import { findLastIndex } from "lodash-es";
import {
  PrimitiveTargetDescriptor,
  RangeTargetDescriptor,
} from "../typings/TargetDescriptor";
import { produce } from "immer";

/**
 * This function exists to enable hoisted modifiers, eg for constructs like
 * "every line air past bat". When we detect a range target which has a hoisted
 * modifier on its anchor, we do the following:
 *
 * 1. Split the anchor's modifier chain, so that everything after the hoisted
 *    modifier remains on the anchor, and we reserve the remaining modifiers.
 * 2. We remove everything before and including the hoisted modifier from the
 *    active, if it ended up there via inference.
 * 3. We modify the range target if required by the hoisted modifier.  For
 *    example "every" ranges need to handle endpoint exclusion carefully.
 * 4. We construct a new {@link TargetMark} that emits the output of the range
 *    target, and move the reserved modifiers to a new primitive target which
 *    starts with this mark.
 *
 * We effectively break the chain into two parts, one that gets distributed over
 * anchor and active, and is applied before constructing the range, and one that
 * is run with the range as its input.  For example:
 *
 * ```
 * "first token every line funk air past bat"
 * ```
 *
 * In this case, we create an "every" range target with anchor `"funk air"` and
 * active `"funk bat"`.  We then apply the modifier `"first token"` to the
 * resulting range.
 *
 * @param targetDescriptor The full range target, post-inference
 * @param isAnchorMarkImplicit `true` if the anchor mark was implicit on the
 * original partial target
 * @returns A new target descriptor which consists of a primitive target with a
 * mark that emits the output of the range target, with the hoisted modifiers
 * applied to it.
 */
export function handleHoistedModifiers(
  targetDescriptor: RangeTargetDescriptor,
  isAnchorMarkImplicit: boolean,
): PrimitiveTargetDescriptor | RangeTargetDescriptor {
  const { anchor, rangeType, active } = targetDescriptor;

  if (anchor.type !== "primitive" || rangeType !== "continuous") {
    return targetDescriptor;
  }

  const indexedModifiers = anchor.modifiers.map((v, i) => [v, i] as const);

  // We iterate through the modifiers in reverse because the closest hoisted
  // modifier to the range owns the range. For example if you say "every line
  // every funk air past bat", the "every line" owns the range, and the "every
  // funk" is applied to the output.
  for (const [modifier, idx] of indexedModifiers.reverse()) {
    for (const hoistedModifierType of hoistedModifierTypes) {
      const acceptanceInfo = hoistedModifierType.accept(modifier);
      if (acceptanceInfo.accepted) {
        // We hoist the modifier and everything that comes before it. Every
        // modifier that comes after it is left on the anchor (and left on the
        // the active if it ended up there via inference from the anchor)
        const [hoistedModifiers, unhoistedModifiers] = [
          anchor.modifiers.slice(0, idx + 1),
          anchor.modifiers.slice(idx + 1),
        ];

        /**
         * The input range target, transformed by removing the hoisted modifiers
         * from anchor and active, and applying any required transformations
         * from the hoisted modifier.
         */
        let pipelineInputDescriptor: RangeTargetDescriptor = {
          ...targetDescriptor,
          anchor:
            // If they say "every line past bat", the anchor is implicit, even though
            // it comes across the wire as a primitive target due to the "every line",
            // which we've now removed
            unhoistedModifiers.length === 0 && isAnchorMarkImplicit
              ? { type: "implicit" }
              : {
                  type: "primitive",
                  mark: anchor.mark,
                  modifiers: unhoistedModifiers,
                },
          // Remove the hoisted modifier (and everything before it) from the
          // active if it ended up there from inference
          active: produce(active, (draft) => {
            draft.modifiers = draft.modifiers.slice(
              findLastIndex(
                draft.modifiers,
                (modifier) => hoistedModifierType.accept(modifier).accepted,
              ) + 1,
            );
          }),
        };

        pipelineInputDescriptor =
          acceptanceInfo.transformTarget?.(pipelineInputDescriptor) ??
          pipelineInputDescriptor;

        // We create a new primitive target which starts with the output of the
        // range target, and has the hoisted modifiers on it
        return {
          type: "primitive",
          mark: {
            type: "target",
            target: pipelineInputDescriptor,
          },
          modifiers: hoistedModifiers,
        };
      }
    }
  }

  return targetDescriptor;
}

interface HoistedModifierAcceptanceInfo {
  accepted: boolean;

  /**
   * If the modifier is accepted, this function is called to transform the
   * input range target.  For example, "every" ranges need to handle endpoint
   * exclusion carefully.
   * @param target The input range target
   */
  transformTarget?(target: RangeTargetDescriptor): RangeTargetDescriptor;
}

interface HoistedModifierType {
  accept(modifier: Modifier): HoistedModifierAcceptanceInfo;
}

/**
 * These modifiers need to be "hoisted" past range targets, ie we run them
 * after running the range, rather than distributing them across anchor and
 * active, the way we do with all other modifiers.
 */
const hoistedModifierTypes: HoistedModifierType[] = [
  // "every" ranges, eg "every line air past bat"
  {
    accept(modifier: Modifier) {
      return modifier.type === "everyScope" &&
        modifier.scopeType.type !== "instance"
        ? {
            accepted: true,
            transformTarget(target: RangeTargetDescriptor) {
              return {
                ...target,
                exclusionScopeType: modifier.scopeType,
              };
            },
          }
        : { accepted: false };
    },
  },

  // "instance" modifiers treat the range as the instance to search for, eg
  // "every instance air past bat" searches for instances of the text of the
  // range "air past bat".
  {
    accept(modifier: Modifier) {
      return {
        accepted:
          (modifier.type === "everyScope" ||
            modifier.type === "relativeScope" ||
            modifier.type === "ordinalScope") &&
          modifier.scopeType.type === "instance",
      };
    },
  },
];
