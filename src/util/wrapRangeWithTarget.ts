import { Range, TextEditor } from "vscode";
import { CommonTargetParameters } from "../processTargets/targets/BaseTarget";
import { Target } from "../typings/target.types";

type TargetConstructor<T extends Target> = new (
  parameters: CommonTargetParameters
) => T;

export function wrapRangeWithTarget<T extends Target>(
  constructor: TargetConstructor<T>,
  editor: TextEditor,
  range: undefined
): undefined;
export function wrapRangeWithTarget<T extends Target>(
  constructor: TargetConstructor<T>,
  editor: TextEditor,
  range: Range
): T;
export function wrapRangeWithTarget<T extends Target>(
  constructor: TargetConstructor<T>,
  editor: TextEditor,
  range: Range | undefined
): T | undefined;
export function wrapRangeWithTarget<T extends Target>(
  constructor: TargetConstructor<T>,
  editor: TextEditor,
  range: Range | undefined
): T | undefined {
  return range == null
    ? undefined
    : new constructor({
        editor,
        isReversed: false,
        contentRange: range,
      });
}
