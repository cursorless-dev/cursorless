import { Range, TextEditor } from "vscode";
import { CommonTargetParameters } from "../processTargets/targets/BaseTarget";
import LineTarget from "../processTargets/targets/LineTarget";
import PlainTarget from "../processTargets/targets/PlainTarget";
import { Target } from "../typings/target.types";

type TargetConstructor<T extends Target> = new (
  parameters: CommonTargetParameters
) => T;

export function constructTarget<T extends Target>(
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

export function constructPlainTarget(
  editor: TextEditor,
  range: Range | undefined,
  isReversed: boolean
): PlainTarget | undefined {
  return constructTarget(PlainTarget, editor, range, isReversed);
}

export function constructLineTarget(
  editor: TextEditor,
  range: Range | undefined,
  isReversed: boolean
): LineTarget | undefined {
  return constructTarget(LineTarget, editor, range, isReversed);
}
