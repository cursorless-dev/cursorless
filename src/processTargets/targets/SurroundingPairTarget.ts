import { Range, TextEditor } from "vscode";
import { RemovalRange } from "../../typings/target.types";
import BaseTarget from "./BaseTarget";

interface SurroundingPairTargetParameters {
  editor: TextEditor;
  isReversed: boolean;
  contentRange: Range;
  delimiter?: string;
  interiorRange?: Range;
  boundary?: [Range, Range];
  leadingDelimiter?: RemovalRange;
  trailingDelimiter?: RemovalRange;
}

export default class SurroundingPairTarget extends BaseTarget {
  constructor(parameters: SurroundingPairTargetParameters) {
    super(parameters);
  }
}
