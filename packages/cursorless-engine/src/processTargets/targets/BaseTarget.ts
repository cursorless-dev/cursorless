import type {
  EnforceUndefined,
  InsertionMode,
  TargetPlainObject,
} from "@cursorless/common";
import {
  NoContainingScopeError,
  Range,
  Selection,
  TextEditor,
  rangeToPlainObject,
} from "@cursorless/common";
import { isEqual } from "lodash";
import type { EditWithRangeUpdater } from "../../typings/Types";
import type { Destination, Target } from "../../typings/target.types";
import { isSameType } from "../../util/typeUtils";
import { createContinuousRange } from "../targetUtil/createContinuousRange";
import { DestinationImpl } from "./DestinationImpl";
import {expandToFullLine} from "../../util/rangeUtils";

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

  getInteriorStrict(): Target[] {
    throw new NoContainingScopeError("interior");
  }
  getBoundaryStrict(): Target[] {
    throw new NoContainingScopeError("boundary");
  }

  private cloneWith(parameters: CloneWithParameters) {
    const constructor = Object.getPrototypeOf(this).constructor;

    return new constructor({
      ...this.getCloneParameters(),
      ...parameters,
    });
  }

  protected abstract getCloneParameters(): EnforceUndefined<TParameters>;

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

export interface UntypedTargetParameters extends CommonTargetParameters {
  readonly hasExplicitRange: boolean;
  readonly isToken?: boolean;
}

/**
 * - Treated as "line" for "pour", "clone", and "breakpoint"
 * - Use token delimiters (space) for removal and insertion
 * - Expand to nearest containing pair when asked for boundary or interior
 */

export class UntypedTarget extends BaseTarget<UntypedTargetParameters> {
  type = "UntypedTarget";
  insertionDelimiter = " ";
  hasExplicitScopeType = false;

  constructor(parameters: UntypedTargetParameters) {
    super(parameters);
    this.hasExplicitRange = parameters.hasExplicitRange;
    this.isToken = parameters.isToken ?? true;
  }

  getLeadingDelimiterTarget(): Target | undefined {
    return getTokenLeadingDelimiterTarget(this);
  }
  getTrailingDelimiterTarget(): Target | undefined {
    return getTokenTrailingDelimiterTarget(this);
  }
  getRemovalRange(): Range {
    // If this range is in the middle of a whitespace sequence we don't want to remove leading or trailing whitespaces.
    return this.editor.document.getText(this.contentRange).trim().length === 0
      ? this.contentRange
      : getTokenRemovalRange(this);
  }

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean
  ): Target {
    return createContinuousRangeUntypedTarget(
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
      isToken: this.isToken,
      hasExplicitRange: this.hasExplicitRange,
    };
  }
}

export function createContinuousRangeUntypedTarget(
  isReversed: boolean,
  startTarget: Target,
  endTarget: Target,
  includeStart: boolean,
  includeEnd: boolean
): UntypedTarget {
  return new UntypedTarget({
    editor: startTarget.editor,
    isReversed,
    hasExplicitRange: true,
    contentRange: createContinuousRange(
      startTarget,
      endTarget,
      includeStart,
      includeEnd
    ),
    isToken: startTarget.isToken && endTarget.isToken,
  });
}

export interface PlainTargetParameters extends CommonTargetParameters {
  readonly isToken?: boolean;
  readonly insertionDelimiter?: string;
}

/**
 * A target that has no leading or trailing delimiters so it's removal range
 * just consists of the content itself. Its insertion delimiter is empty string,
 * unless specified.
 */
export class PlainTarget extends BaseTarget<PlainTargetParameters> {
  type = "PlainTarget";
  insertionDelimiter: string;

  constructor(parameters: PlainTargetParameters) {
    super(parameters);
    this.isToken = parameters.isToken ?? true;
    this.insertionDelimiter = parameters.insertionDelimiter ?? "";
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.contentRange;

  protected getCloneParameters() {
    return {
      ...this.state,
      isToken: this.isToken,
      insertionDelimiter: this.insertionDelimiter,
    };
  }
}

const leadingDelimiters = ['"', "'", "(", "[", "{", "<"];
const trailingDelimiters = ['"', "'", ")", "]", "}", ">", ",", ";", ":"];

export function getTokenLeadingDelimiterTarget(
  target: Target
): Target | undefined {
  const {editor} = target;
  const {start} = target.contentRange;

  const startLine = editor.document.lineAt(start);
  const leadingText = startLine.text.slice(0, start.character);
  const leadingDelimiters = leadingText.match(/\s+$/);

  return leadingDelimiters == null
    ? undefined
    : new PlainTarget({
      contentRange: new Range(
        start.line,
        start.character - leadingDelimiters[0].length,
        start.line,
        start.character
      ),
      editor,
      isReversed: target.isReversed,
    });
}
export function getTokenTrailingDelimiterTarget(
  target: Target
): Target | undefined {
  const {editor} = target;
  const {end} = target.contentRange;

  const endLine = editor.document.lineAt(end);
  const trailingText = endLine.text.slice(end.character);
  const trailingDelimiters = trailingText.match(/^\s+/);

  return trailingDelimiters == null
    ? undefined
    : new PlainTarget({
      contentRange: new Range(
        end.line,
        end.character,
        end.line,
        end.character + trailingDelimiters[0].length
      ),
      editor,
      isReversed: target.isReversed,
    });
}
/**
 * Constructs a removal range for the given target that may remove whitespace on
 * one side. This removal range is designed to be used with things that should
 * clean themselves up as if they're a range of tokens.
 *
 * We determine whether to include adjacent whitespace based on the following
 * rules:
 *
 * - If we would just be leaving a line with whitespace on it, we delete the
 *   whitespace
 * - Otherwise, if there is trailing whitespace, we include it if any of the
 *   following is true:
 *   - there is leading whitespace, OR
 *   - we are at start of line, OR
 *   - there is an approved leading delimiter character (eg `(`, `[`, etc).
 * - Otherwise, if there is leading whitespace, we include it if any of the
 *   following is true:
 *   - we are at end of line, OR
 *   - there is an approved trailing delimiter character (eg `)`, `]`, `:`, `;`,
 *     etc).
 * - Otherwise, we don't include any adjacent whitespace
 *
 * @param target The target to get the token removal range for
 * @returns The removal range for the given target
 */

export function getTokenRemovalRange(target: Target): Range {
  const {editor, contentRange} = target;
  const {start, end} = contentRange;

  const leadingWhitespaceRange = target.getLeadingDelimiterTarget()?.contentRange ?? start.toEmptyRange();

  const trailingWhitespaceRange = target.getTrailingDelimiterTarget()?.contentRange ?? end.toEmptyRange();

  const fullLineRange = expandToFullLine(editor, contentRange);

  if (leadingWhitespaceRange
    .union(trailingWhitespaceRange)
    .isRangeEqual(fullLineRange)) {
    // If we would just be leaving a line with whitespace on it, we delete the
    // whitespace
    return fullLineRange;
  }

  // Use trailing range if: There is a leading range OR there is no leading
  // content OR there is an approved leading delimiter character
  if (!trailingWhitespaceRange.isEmpty) {
    if (!leadingWhitespaceRange.isEmpty ||
      contentRange.start.isEqual(fullLineRange.start) ||
      leadingDelimiters.includes(getLeadingCharacter(editor, contentRange))) {
      return contentRange.union(trailingWhitespaceRange);
    }
  }

  // Use leading range if: There is no trailing content OR there is an approved
  // trailing delimiter character
  if (!leadingWhitespaceRange.isEmpty) {
    if (contentRange.end.isEqual(fullLineRange.end) ||
      trailingDelimiters.includes(getTrailingCharacter(editor, contentRange))) {
      return contentRange.union(leadingWhitespaceRange);
    }
  }

  // Otherwise just return the content range
  return contentRange;
}

function getLeadingCharacter(editor: TextEditor, contentRange: Range): string {
  const {start} = contentRange;
  const line = editor.document.lineAt(start);
  return start.isAfter(line.range.start)
    ? editor.document.getText(new Range(start.translate(undefined, -1), start))
    : "";
}

function getTrailingCharacter(editor: TextEditor, contentRange: Range): string {
  const {end} = contentRange;
  const line = editor.document.lineAt(end);
  return end.isBefore(line.range.end)
    ? editor.document.getText(new Range(end.translate(undefined, 1), end))
    : "";
}

