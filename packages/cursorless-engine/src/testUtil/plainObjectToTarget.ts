import type { TargetPlainObject, TextEditor } from "@cursorless/common";
import { plainObjectToRange } from "@cursorless/common";
import { LineTarget, UntypedTarget } from "../processTargets/targets";
import type { Target } from "../typings/target.types";

/**
 * Given a plain object describing a target, constructs a `Target` object.
 * Note that the target object today doesn't include a reference to an editor,
 * because all of our recorded tests are on single editors, so we just construct
 * a target where the ranges refer to {@link editor}.
 *
 * Note that this function is just a partial implementation today, throwing an
 * exception if we try to rehydrate anything other than an `UntypedTarget`.
 *
 * @param editor The editor where the target ranges are defined
 * @param plainObject A plain object describing a `Target`
 * @returns A `Target` constructed from the given plain object
 */
export function plainObjectToTarget(
  editor: TextEditor,
  plainObject: TargetPlainObject,
): Target {
  switch (plainObject.type) {
    case "UntypedTarget":
      return new UntypedTarget({
        editor,
        isReversed: plainObject.isReversed,
        contentRange: plainObjectToRange(plainObject.contentRange),
        hasExplicitRange: plainObject.hasExplicitRange,
      });
    case "LineTarget":
      return new LineTarget({
        editor,
        isReversed: plainObject.isReversed,
        contentRange: plainObjectToRange(plainObject.contentRange),
      });
    default:
      throw Error(`Unsupported target type ${plainObject.type}`);
  }
}
