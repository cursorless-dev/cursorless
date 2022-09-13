import { Position, Range, Selection } from "vscode";
import { TestDecoration } from "../core/editStyles";
import type { Target } from "../typings/target.types";
import { Token } from "../typings/Types";

export type PositionPlainObject = {
  line: number;
  character: number;
};

export type RangePlainObject = {
  start: PositionPlainObject;
  end: PositionPlainObject;
};

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
   * The type name of the target, eg `UntypedTarget`. If excluded, assumed to be
   * `"UntypedTarget"`.
   */
  type?: string;

  /**
   * Corresponds to {@link Target.contentRange}
   */
  contentRange: RangePlainObject;

  /**
   * Corresponds to {@link Target.isReversed}.  If excluded, assumed to be `false`.
   */
  isReversed?: boolean;

  /**
   * Corresponds to {@link Target.hasExplicitRange}.  If excluded, assumed to
   * be `true`.
   */
  hasExplicitRange?: boolean;
};

/**
 * Returns an object including only the optional fields of {@link T}
 */
type GetOptional<T> = {
  [K in keyof T as Pick<T, K> extends Required<Pick<T, K>> ? never : K]: T[K];
};

/**
 * For concision, any fields in a {@link TargetPlainObject} which are equal to
 * the default value from this object will be excluded from serialisation.  We
 * re-insert these default values during deserialisation.
 */
export const TARGET_DEFAULTS: Required<GetOptional<TargetPlainObject>> = {
  type: "UntypedTarget",
  isReversed: false,
  hasExplicitRange: true,
};

export type KeyWithDefault = Exclude<keyof typeof TARGET_DEFAULTS, "type">;

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
  selection: Selection
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
 * Note that we exclude any attributes that are equal to their value in
 * {@link TARGET_DEFAULTS} for concision.
 *
 * @param target The target to convert to a plain object
 * @returns A plain object that can be json serialized
 */
export function targetToPlainObject(target: Target): TargetPlainObject {
  const returnValue = {
    type: target.constructor.name,
    contentRange: rangeToPlainObject(target.contentRange),
    isReversed: target.isReversed,
    hasExplicitRange: target.hasExplicitRange,
  };

  // To remove any entries that are equal to their defaults for concision
  for (const [key, defaultValue] of Object.entries(TARGET_DEFAULTS)) {
    if (returnValue[key as KeyWithDefault] === defaultValue) {
      delete returnValue[key as KeyWithDefault];
    }
  }

  return returnValue;
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
      (serializedMarks[key] = rangeToPlainObject(value.range))
  );
  return serializedMarks;
}

export function testDecorationsToPlainObject(decorations: TestDecoration[]) {
  return decorations.map(({ name, type, start, end }) => ({
    name,
    type,
    start: positionToPlainObject(start),
    end: positionToPlainObject(end),
  }));
}
