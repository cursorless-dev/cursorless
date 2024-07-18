import {
  ImplicitTargetDescriptor,
  Modifier,
  PartialMark,
  PartialRangeMark,
  PartialRangeType,
  PartialTargetMark,
  RangeMarkFor,
  ScopeType,
} from "@cursorless/common";

export type Mark =
  | Exclude<PartialMark, PartialTargetMark | PartialRangeMark>
  | TargetMark
  | RangeMark;

export type RangeMark = RangeMarkFor<Mark>;

export interface PrimitiveTargetDescriptor {
  type: "primitive";

  /**
   * The mark, eg "air", "this", "that", etc
   */
  mark: Mark;

  /**
   * Zero or more modifiers that will be applied in sequence to the output from
   * the mark.  Note that the modifiers will be applied in reverse order.  For
   * example, if the user says "take first char name air", then we will apply
   * "name" to the output of "air" to select the name of the function or
   * statement containing "air", then apply "first char" to select the first
   * character of the name.
   */
  modifiers: Modifier[];
}

/**
 * Can be used when constructing a primitive target that applies modifiers to
 * the output of some other complex target descriptor.  For example, we use this
 * to apply the hoisted modifiers to the output of a range target when we hoist
 * the "every funk" modifier on a command like "take every funk air until bat".
 */
export interface TargetMark {
  type: "target";

  /**
   * The target descriptor that will be used to generate the targets output by
   * this mark.
   */
  target: TargetDescriptor;
}

export interface RangeTargetDescriptor {
  type: "range";
  anchor: PrimitiveTargetDescriptor | ImplicitTargetDescriptor;
  active: PrimitiveTargetDescriptor;
  excludeAnchor: boolean;
  excludeActive: boolean;
  rangeType: PartialRangeType;

  /**
   * Indicates that endpoints should be excluded by going to the next or
   * previous instance of the given scope type, rather than the default behavior
   * of moving to the start or end of the given endpoint target. This field is primarily
   * used by "every" ranges, eg "every funk air until bat"
   */
  exclusionScopeType?: ScopeType;
}

export interface ListTargetDescriptor {
  type: "list";
  elements: (PrimitiveTargetDescriptor | RangeTargetDescriptor)[];
}

export type TargetDescriptor =
  | PrimitiveTargetDescriptor
  | RangeTargetDescriptor
  | ListTargetDescriptor
  | ImplicitTargetDescriptor;
