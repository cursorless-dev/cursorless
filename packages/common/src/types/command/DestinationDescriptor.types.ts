import type {
  PartialListTargetDescriptor,
  PartialPrimitiveTargetDescriptor,
  PartialRangeTargetDescriptor,
} from "./PartialTargetDescriptor.types";

/**
 * The insertion mode to use when inserting relative to a target.
 * - `before` inserts before the target.  Depending on the target, a delimiter
 *   may be inserted after the inserted text.
 * - `after` inserts after the target.  Depending on the target, a delimiter may
 *   be inserted before the inserted text.
 * - `to` replaces the target.  However, this insertion mode may also be used
 *   when the target is really only a pseudo-target.  For example, you could say
 *   `"bring type air to bat"` even if `bat` doesn't already have a type.  In
 *   that case, `"take type bat"` wouldn't work, so `"type bat"` is really just
 *   a pseudo-target in that situation.
 */
export type InsertionMode = "before" | "after" | "to";

export interface PrimitiveDestinationDescriptor {
  type: "primitive";

  /**
   * The insertion mode to use when inserting relative to {@link target}.
   */
  insertionMode: InsertionMode;

  target:
    | PartialPrimitiveTargetDescriptor
    | PartialRangeTargetDescriptor
    | PartialListTargetDescriptor;
}

/**
 * A list of destinations.  This is used when the user uses more than one insertion mode
 * in a single command.  For example, `"bring air after bat and before cap"`.
 */
export interface ListDestinationDescriptor {
  type: "list";
  destinations: PrimitiveDestinationDescriptor[];
}

/**
 * An implicit destination.  This is used for e.g. `"bring air"` (note the user
 * doesn't explicitly specify the destination), or `"snip funk"`.
 */
export interface ImplicitDestinationDescriptor {
  type: "implicit";
}

export type DestinationDescriptor =
  | ListDestinationDescriptor
  | PrimitiveDestinationDescriptor
  | ImplicitDestinationDescriptor;
