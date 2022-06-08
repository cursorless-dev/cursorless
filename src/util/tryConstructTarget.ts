import { Range, TextEditor } from "vscode";
import { CommonTargetParameters } from "../processTargets/targets/BaseTarget";
import LineTarget from "../processTargets/targets/LineTarget";
import PlainTarget from "../processTargets/targets/PlainTarget";
import { Target } from "../typings/target.types";

type TargetConstructor<T extends Target> = new (
  parameters: CommonTargetParameters
) => T;

/**
 * Constructs a target from the given range or returns undefined if the range is
 * undefined
 * @param constructor The type of target to construct
 * @param editor The editor containing the range
 * @param range The range to convert into a target
 * @param isReversed Whether the rain should be backward
 * @returns A new target constructed from the given range, or null if the range
 * is undefined
 */
export function tryConstructTarget<T extends Target>(
  constructor: TargetConstructor<T>,
  editor: TextEditor,
  range: Range | undefined,
  isReversed: boolean
): T | undefined {
  return range == null
    ? undefined
    : new constructor({
        editor,
        isReversed,
        contentRange: range,
      });
}

/**
 * Constructs a {@link PlainTarget} from the given range, or returns undefined
 * if the range is undefined
 * @param editor The editor containing the range
 * @param range The range to convert into a target
 * @param isReversed Whether the rain should be backward
 * @returns A new {@link PlainTarget} constructed from the given range, or null
 * if the range is undefined
 */
export function tryConstructPlainTarget(
  editor: TextEditor,
  range: Range | undefined,
  isReversed: boolean
): PlainTarget | undefined {
  return tryConstructTarget(PlainTarget, editor, range, isReversed);
}

/**
 * Constructs a {@link LineTarget} from the given range, or returns undefined
 * if the range is undefined
 * @param editor The editor containing the range
 * @param range The range to convert into a target
 * @param isReversed Whether the rain should be backward
 * @returns A new {@link LineTarget} constructed from the given range, or null
 * if the range is undefined
 */
export function constructLineTarget(
  editor: TextEditor,
  range: Range | undefined,
  isReversed: boolean
): LineTarget | undefined {
  return tryConstructTarget(LineTarget, editor, range, isReversed);
}
