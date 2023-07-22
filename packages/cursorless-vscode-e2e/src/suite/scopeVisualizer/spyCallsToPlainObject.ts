import { rangeToPlainObject } from "@cursorless/common";
import { DecorationRenderOptions } from "vscode";
import {
  SetDecorationsParameters,
  DecorationRangesPlainObject,
  DecorationRenderOptionsPlainObject,
  MockDecorationType,
} from "./scopeVisualizerTest.types";
import { SinonSpyCall } from "sinon";

export function setDecorationsCallToPlainObject({
  args: [_editor, decorationType, ranges],
}: SinonSpyCall<SetDecorationsParameters>): DecorationRangesPlainObject {
  return {
    decorationId: decorationType.id,
    ranges: ranges.map(rangeToPlainObject),
  };
}

export function createDecorationTypeCallToPlainObject({
  args: [options],
  returnValue: decorationType,
}: SinonSpyCall<
  [DecorationRenderOptions],
  MockDecorationType
>): DecorationRenderOptionsPlainObject {
  return {
    backgroundColor: options.dark?.backgroundColor?.toString(),
    borderColor: options.dark?.borderColor?.toString(),
    borderStyle: options.borderStyle,
    borderRadius: options.borderRadius,
    isWholeLine: options.isWholeLine ?? false,
    id: decorationType.id,
  };
}
