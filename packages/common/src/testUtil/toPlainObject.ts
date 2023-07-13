import type {
  CharacterRange,
  GeneralizedRange,
  LineRange,
  Message,
  SpyIDERecordedValues,
} from "..";
import { FlashStyle, isLineRange } from "..";
import { Token } from "../types/Token";
import { Selection } from "../types/Selection";

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
  flashes: PlainFlashDescriptor[] | undefined;
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

/**
 * Simplified Position interface containing only what we need for serialization
 */
interface SimplePosition {
  line: number;
  character: number;
}

/**
 * Simplified Range interface containing only what we need for serialization
 */
interface SimpleRange {
  start: SimplePosition;
  end: SimplePosition;
}

export function rangeToPlainObject(range: SimpleRange): RangePlainObject {
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

export function positionToPlainObject({
  line,
  character,
}: SimplePosition): PositionPlainObject {
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
    flashes: input.flashes?.map((descriptor) => ({
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
