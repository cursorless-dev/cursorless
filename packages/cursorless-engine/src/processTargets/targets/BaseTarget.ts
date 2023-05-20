import {
  NoContainingScopeError,
  Range,
  Selection,
  TextEditor,
} from "@cursorless/common";
import { isEqual } from "lodash";
import type { TargetPosition } from "@cursorless/common";
import type { EditNewActionType, Target } from "../../typings/target.types";
import type { EditWithRangeUpdater } from "../../typings/Types";
import { isSameType } from "../../util/typeUtils";
import { toPositionTarget } from "../modifiers/toPositionTarget";
import {
  createContinuousRange,
  createContinuousRangeUntypedTarget,
} from "../targetUtil/createContinuousRange";

/** Parameters supported by most target classes */
export interface CommonTargetParameters {
  readonly editor: TextEditor;
  readonly isReversed: boolean;
  readonly contentRange: Range;
  readonly thatTarget?: Target;
}

export interface CloneWithParameters {
  readonly thatTarget?: Target;
  readonly contentRange?: Range;
}

export default abstract class BaseTarget implements Target {
  protected readonly state: CommonTargetParameters;
  isLine = false;
  hasExplicitScopeType = true;
  hasExplicitRange = true;
  isRaw = false;
  isImplicit = false;
  isNotebookCell = false;

  constructor(parameters: CommonTargetParameters) {
    this.state = {
      editor: parameters.editor,
      isReversed: parameters.isReversed,
      contentRange: parameters.contentRange,
      thatTarget: parameters.thatTarget,
    };
  }

  get editor() {
    return this.state.editor;
  }
  get isReversed() {
    return this.state.isReversed;
  }

  get thatTarget(): Target {
    return this.state.thatTarget != null
      ? this.state.thatTarget.thatTarget
      : this;
  }

  get contentText(): string {
    return this.editor.document.getText(this.contentRange);
  }

  get contentSelection(): Selection {
    return this.contentRange.toSelection(this.isReversed);
  }

  get contentRange(): Range {
    return this.state.contentRange;
  }

  constructChangeEdit(text: string): EditWithRangeUpdater {
    return {
      range: this.contentRange,
      text,
      updateRange: (range) => range,
    };
  }

  constructRemovalEdit(): EditWithRangeUpdater {
    return {
      range: this.getRemovalRange(),
      text: "",
      updateRange: (range) => range,
    };
  }

  getEditNewActionType(): EditNewActionType {
    return "edit";
  }

  getRemovalHighlightRange(): Range {
    return this.getRemovalRange();
  }

  withThatTarget(thatTarget: Target): Target {
    return this.cloneWith({ thatTarget });
  }

  withContentRange(contentRange: Range): Target {
    return this.cloneWith({ contentRange });
  }

  getInteriorStrict(): Target[] {
    throw new NoContainingScopeError("interior");
  }
  getBoundaryStrict(): Target[] {
    throw new NoContainingScopeError("boundary");
  }

  readonly cloneWith = (parameters: CloneWithParameters) => {
    const constructor = Object.getPrototypeOf(this).constructor;

    return new constructor({
      ...this.getCloneParameters(),
      ...parameters,
    });
  };

  protected abstract getCloneParameters(): object;

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean,
  ): Target {
    if (isSameType(this, endTarget)) {
      const constructor = Object.getPrototypeOf(this).constructor;

      return new constructor({
        ...this.getCloneParameters(),
        isReversed,
        contentRange: createContinuousRange(
          this,
          endTarget,
          includeStart,
          includeEnd,
        ),
      });
    }

    return createContinuousRangeUntypedTarget(
      isReversed,
      this,
      endTarget,
      includeStart,
      includeEnd,
    );
  }

  isEqual(otherTarget: Target): boolean {
    return (
      otherTarget instanceof BaseTarget &&
      isEqual(this.getEqualityParameters(), otherTarget.getEqualityParameters())
    );
  }

  /**
   * Constructs an object that can be used for determining equality between two
   * {@link BaseTarget} objects. We proceed by just getting the objects clone
   * parameters and removing the `thatTarget`.
   *
   * We would prefer to instead merge the `thatTarget`s into a list. See #780
   * for more details.
   *
   * @returns The object to be used for determining equality
   */
  protected getEqualityParameters(): object {
    const { thatTarget, ...otherCloneParameters } =
      this.getCloneParameters() as { thatTarget?: Target };

    return {
      ...otherCloneParameters,
    };
  }

  toPositionTarget(position: TargetPosition): Target {
    return toPositionTarget(this, position);
  }

  abstract get insertionDelimiter(): string;
  abstract getLeadingDelimiterTarget(): Target | undefined;
  abstract getTrailingDelimiterTarget(): Target | undefined;
  abstract getRemovalRange(): Range;
}
