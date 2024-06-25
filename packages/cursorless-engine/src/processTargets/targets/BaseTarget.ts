import type {
  EnforceUndefined,
  InsertionMode,
  TargetPlainObject,
} from "@cursorless/common";
import {
  Range,
  Selection,
  TextEditor,
  rangeToPlainObject,
} from "@cursorless/common";
import { isEqual } from "lodash";
import type { EditWithRangeUpdater } from "../../typings/Types";
import type { Destination, Target } from "../../typings/target.types";
import { DestinationImpl } from "./DestinationImpl";
import { createContinuousRange } from "./util/createContinuousRange";

/** Parameters supported by all target classes */
export interface MinimumTargetParameters {
  readonly editor: TextEditor;
  readonly isReversed: boolean;
  readonly thatTarget?: Target;
}

/** Parameters supported by most target classes */
export interface CommonTargetParameters extends MinimumTargetParameters {
  readonly contentRange: Range;
}

export interface CloneWithParameters {
  readonly thatTarget?: Target;
  readonly contentRange?: Range;
}

/**
 * An abstract target. All targets subclass this.
 *
 * @template TParameters The constructor parameters.
 */
export abstract class BaseTarget<
  in out TParameters extends MinimumTargetParameters,
> implements Target
{
  protected abstract readonly type: string;
  protected readonly state: EnforceUndefined<CommonTargetParameters>;
  isLine = false;
  isToken = true;
  hasExplicitScopeType = true;
  hasExplicitRange = true;
  isRaw = false;
  isImplicit = false;
  isNotebookCell = false;
  isWord = false;

  constructor(parameters: TParameters & CommonTargetParameters) {
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

  constructRemovalEdit(): EditWithRangeUpdater {
    return {
      range: this.getRemovalRange(),
      text: "",
      updateRange: (range) => range,
    };
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

  getInterior(): Target[] | undefined {
    return undefined;
  }
  getBoundary(): Target[] | undefined {
    return undefined;
  }

  private cloneWith(parameters: CloneWithParameters) {
    const constructor = Object.getPrototypeOf(this).constructor;

    return new constructor({
      ...this.getCloneParameters(),
      ...parameters,
    });
  }

  protected abstract getCloneParameters(): EnforceUndefined<TParameters>;

  maybeCreateRichRangeTarget(
    isReversed: boolean,
    endTarget: ThisType<this> & Target,
  ): (ThisType<this> & Target) | null {
    const { constructor } = Object.getPrototypeOf(this);

    return new constructor({
      ...this.getCloneParameters(),
      isReversed,
      contentRange: createContinuousRange(this, endTarget, true, true),
    });
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
  protected getEqualityParameters(): Omit<
    EnforceUndefined<TParameters>,
    "thatTarget"
  > {
    const { thatTarget, ...otherCloneParameters } = this.getCloneParameters();

    return {
      ...otherCloneParameters,
    };
  }

  toDestination(insertionMode: InsertionMode): Destination {
    return new DestinationImpl(this, insertionMode);
  }

  /**
   * Converts the target to a plain object representation.
   *
   * Note that this implementation is quite incomplete, but is suitable for
   * round-tripping {@link UntypedTarget} objects and capturing the fact that an
   * object is not an un typed target if it is not, via the {@link type}
   * attribute.  In the future, we should override this method in subclasses to
   * provide a more complete representation.
   * @returns A plain object representation of the target
   */
  toPlainObject(): TargetPlainObject {
    return {
      type: this.type,
      contentRange: rangeToPlainObject(this.contentRange),
      isReversed: this.isReversed,
      hasExplicitRange: this.hasExplicitRange,
    };
  }

  abstract get insertionDelimiter(): string;
  abstract getLeadingDelimiterTarget(): Target | undefined;
  abstract getTrailingDelimiterTarget(): Target | undefined;
  abstract getRemovalRange(): Range;
}
