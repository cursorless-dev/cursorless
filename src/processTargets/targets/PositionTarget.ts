import { Position, Target, TargetType } from "../../typings/target.types";
import { createContinuousRange } from "../targetUtil/createContinuousRange";
import BaseTarget, {
  CloneWithParameters,
  CommonTargetParameters,
} from "./BaseTarget";
import { createContinuousRangeWeakTarget } from "./WeakTarget";

interface PositionTargetParameters extends CommonTargetParameters {
  readonly position: Position;
  readonly delimiter?: string;
}

export default class PositionTarget extends BaseTarget {
  private position_: Position;
  private delimiter_: string | undefined;

  constructor(parameters: PositionTargetParameters) {
    super(parameters);
    this.position_ = parameters.position;
    this.delimiter_ = parameters.delimiter;
  }

  get type(): TargetType {
    return "position";
  }
  get delimiter() {
    return this.delimiter_;
  }
  get position() {
    return this.position_;
  }

  getLeadingDelimiterRange() {
    return undefined;
  }
  getTrailingDelimiterRange() {
    return undefined;
  }

  maybeAddDelimiter(text: string): string {
    if (this.delimiter == null) {
      return text;
    }
    switch (this.position) {
      case "before":
        return text + this.delimiter;
      case "after":
        return this.delimiter + text;
      default:
        return text;
    }
  }

  cloneWith(parameters: CloneWithParameters) {
    return new PositionTarget({
      ...this.getCloneParameters(),
      ...parameters,
    });
  }

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean
  ): Target {
    if (this.isSameType(endTarget)) {
      return new PositionTarget({
        ...this.getCloneParameters(),
        isReversed,
        contentRange: createContinuousRange(
          this,
          endTarget,
          includeStart,
          includeEnd
        ),
      });
    }

    return createContinuousRangeWeakTarget(
      isReversed,
      this,
      endTarget,
      includeStart,
      includeEnd
    );
  }

  protected getCloneParameters() {
    return {
      ...this.state,
      position: this.position_,
      delimiter: this.delimiter_,
    };
  }
}
