import type {
  CharacterRange,
  GeneralizedRange,
  LineRange,
  Message,
  Position,
  Range,
  Selection,
  SpyIDERecordedValues,
} from "@cursorless/common";
import { FlashStyle, isLineRange } from "@cursorless/common";
import type { Target } from "../../../typings/target.types";
import type { Token } from "../../../typings/Types";

export type PositionPlainObject = {
  line: number;
  character: number;
};

export type RangePlainObject = {
  start: PositionPlainObject;
  end: PositionPlainObject;
};

export type CharacterRangePlainObject = {
  type: "character";
  start: PositionPlainObject;
  end: PositionPlainObject;
};

export type GeneralizedRangePlainObject = CharacterRangePlainObject | LineRange;

interface PlainFlashDescriptor {
  style: keyof typeof FlashStyle;
  range: GeneralizedRangePlainObject;
}

interface PlainHighlight {
  highlightId: string | undefined;
  ranges: GeneralizedRangePlainObject[];
}

export interface PlainSpyIDERecordedValues {
  messages: Message[] | undefined;
  flashedRanges: PlainFlashDescriptor[] | undefined;
  highlights: PlainHighlight[] | undefined;
}

export type SelectionPlainObject = {
  anchor: PositionPlainObject;
  active: PositionPlainObject;
};

/**
 * Type for a plain object representing a {@link Target}, to be used for
 * serialization via json.  Note that this definition is still quite incomplete,
 * as it is missing a lot of attributes, so today can only properly round-trip
 * an `UntypedTarget`, but for other types it at least captures the fact that
 * they are not `UntypedTargets`, so we can use to check that actions return
 * rich targets, even if we don't check everything about the target, and we
 * can't use it to construct rich targets as inputs to actions in tests.
 */
export type TargetPlainObject = {
  /**
   * The type name of the target, eg `UntypedTarget`.
   */
  type: string;

  /**
   * Corresponds to {@link Target.contentRange}
   */
  contentRange: RangePlainObject;

  /**
   * Corresponds to {@link Target.isReversed}.
   */
  isReversed: boolean;

  /**
   * Corresponds to {@link Target.hasExplicitRange}.
   */
  hasExplicitRange: boolean;
};

export type SerializedMarks = {
  [decoratedCharacter: string]: RangePlainObject;
};

export function rangeToPlainObject(range: Range): RangePlainObject {
  return {
    start: positionToPlainObject(range.start),
    end: positionToPlainObject(range.end),
  };
}

export function selectionToPlainObject(
  selection: Selection,
): SelectionPlainObject {
  return {
    anchor: positionToPlainObject(selection.anchor),
    active: positionToPlainObject(selection.active),
  };
}

/**
 * Given a target, constructs an object suitable for serialization by json. Note
 * that this implementation is quite incomplete, but is suitable for
 * round-tripping {@link UntypedTarget} objects and capturing the fact that an
 * object is not an un typed target if it is not, via the {@link type}
 * attribute.
 *
 * @param target The target to convert to a plain object
 * @returns A plain object that can be json serialized
 */
export function targetToPlainObject(target: Target): TargetPlainObject {
  return {
    type: target.constructor.name,
    contentRange: rangeToPlainObject(target.contentRange),
    isReversed: target.isReversed,
    hasExplicitRange: target.hasExplicitRange,
  };
}

export function positionToPlainObject({
  line,
  character,
}: Position): PositionPlainObject {
  return { line, character };
}

export function marksToPlainObject(marks: {
  [decoratedCharacter: string]: Token;
}) {
  const serializedMarks: SerializedMarks = {};
  Object.entries(marks).forEach(
    ([key, value]: [string, Token]) =>
      (serializedMarks[key] = rangeToPlainObject(value.range)),
  );
  return serializedMarks;
}

export function generalizedRangeToPlainObject(
  range: GeneralizedRange,
): GeneralizedRangePlainObject {
  return isLineRange(range) ? range : characterRangeToPlainObject(range);
}

export function characterRangeToPlainObject(
  range: CharacterRange,
): CharacterRangePlainObject {
  return {
    type: "character",
    start: positionToPlainObject(range.start),
    end: positionToPlainObject(range.end),
  };
}

export function spyIDERecordedValuesToPlainObject(
  input: SpyIDERecordedValues,
): PlainSpyIDERecordedValues {
  return {
    messages: input.messages,
    flashedRanges: input.flashedRanges?.map((descriptor) => ({
      style: descriptor.style,
      range: generalizedRangeToPlainObject(descriptor.range),
    })),
    highlights: input.highlights?.map((highlight) => ({
      highlightId: highlight.highlightId,
      ranges: highlight.ranges.map((range) =>
        generalizedRangeToPlainObject(range),
      ),
    })),
  };
}
