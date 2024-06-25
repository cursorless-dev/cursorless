import { Range } from "@cursorless/common";
import { BaseTarget, MinimumTargetParameters } from "./BaseTarget";
import { Target } from "../../typings/target.types";
import {
  getTokenLeadingDelimiterTarget,
  getTokenRemovalRange,
  getTokenTrailingDelimiterTarget,
} from "./util/insertionRemovalBehaviors/TokenInsertionRemovalBehavior";
import { PlainTarget } from "./PlainTarget";

export interface HeadTailTargetParameters extends MinimumTargetParameters {
  inputTarget: Target;
  modifiedTarget: Target;
  isHead: boolean;
}

export class HeadTailTarget extends BaseTarget<HeadTailTargetParameters> {
  type = "HeadTailTarget";
  insertionDelimiter = " ";
  private readonly inputTarget: Target;
  private readonly modifiedTarget: Target;
  private readonly isHead: boolean;

  constructor(parameters: HeadTailTargetParameters) {
    const { inputTarget, modifiedTarget, isHead } = parameters;
    super({
      ...parameters,
      contentRange: constructRange(
        inputTarget.contentRange,
        modifiedTarget.contentRange,
        isHead,
      ),
    });
    this.inputTarget = inputTarget;
    this.modifiedTarget = modifiedTarget;
    this.isHead = isHead;
  }
  getLeadingDelimiterTarget(): Target | undefined {
    return getTokenLeadingDelimiterTarget(this);
  }
  getTrailingDelimiterTarget(): Target | undefined {
    return getTokenTrailingDelimiterTarget(this);
  }
  getRemovalRange(): Range {
    return getTokenRemovalRange(this);
  }
  getInterior(): Target[] | undefined {
    const modifiedInterior = this.modifiedTarget.getInterior();
    if (modifiedInterior == null) {
      return undefined;
    }
    return modifiedInterior.map((target) => {
      return new PlainTarget({
        editor: this.editor,
        contentRange: constructRange(
          this.inputTarget.contentRange,
          target.contentRange,
          this.isHead,
        ),
        isReversed: this.isReversed,
      });
    });
  }

  protected getCloneParameters() {
    return {
      ...this.state,
      inputTarget: this.inputTarget,
      modifiedTarget: this.modifiedTarget,
      isHead: this.isHead,
    };
  }
}

function constructRange(
  originalRange: Range,
  modifiedRange: Range,
  isHead: boolean,
): Range {
  return isHead
    ? new Range(modifiedRange.start, originalRange.end)
    : new Range(originalRange.start, modifiedRange.end);
}
