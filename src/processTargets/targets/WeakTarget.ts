import { Range, TextEditor } from "vscode";
import { Position } from "../../typings/target.types";
import { getTokenDelimiters } from "../modifiers/scopeTypeStages/TokenStage";
import BaseTarget from "./BaseTarget";

interface WeakTargetParameters {
  editor: TextEditor;
  isReversed: boolean;
  contentRange: Range;
  position?: Position;
}

/**
 * - Treated as "line" for "pour", "clone", and "breakpoint"
 * - Use token delimiters (space) for removal and insertion
 * - Expand to nearest containing pair when asked for boundary or interior
 */
export default class WeakTarget extends BaseTarget {
  constructor(parameters: WeakTargetParameters) {
    super({
      ...parameters,
      ...getTokenDelimiters(parameters.editor, parameters.contentRange),
    });
  }
}
