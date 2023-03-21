import { rangeToPlainObject, TargetPlainObject } from "@cursorless/common";
import { Target } from "../typings/target.types";

/**
 * Given a target, constructs an object suitable for serialization by json. Note
 * that this implementation is quite incomplete, but is suitable for
 * round-tripping {@link UntypedTarget} objects and capturing the fact that an
 * object is not an un typed target if it is not, via the {@link type}
 * attribute.
 *
 * @param target The target to convert to a plain object
 * @returns A plain object that can be json serialized
 */

export function targetToPlainObject(target: Target): TargetPlainObject {
  return {
    type: target.constructor.name,
    contentRange: rangeToPlainObject(target.contentRange),
    isReversed: target.isReversed,
    hasExplicitRange: target.hasExplicitRange,
  };
}
