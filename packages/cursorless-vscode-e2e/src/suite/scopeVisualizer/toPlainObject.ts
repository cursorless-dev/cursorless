import { rangeToPlainObject } from "@cursorless/common";
import { DecorationRenderOptions } from "vscode";
import {
  SetDecorationsParameters,
  DecorationRangesPlainObject,
  DecorationRenderOptionsPlainObject,
} from "./scopeVisualizerTest.types";

export function setDecorationsArgsToPlainObject(
  ...[_editor, decorationType, ranges]: SetDecorationsParameters
): DecorationRangesPlainObject {
  return {
    decorationType: decorationType.id,
    ranges: ranges.map(rangeToPlainObject),
  };
}

export function decorationRenderOptionsToPlainObject(
  options: DecorationRenderOptions,
): DecorationRenderOptionsPlainObject {
  return {
    backgroundColor: options.dark?.backgroundColor?.toString(),
    borderColor: options.dark?.borderColor?.toString(),
    borderStyle: options.borderStyle,
    borderRadius: options.borderRadius,
    isWholeLine: options.isWholeLine ?? false,
  };
}
