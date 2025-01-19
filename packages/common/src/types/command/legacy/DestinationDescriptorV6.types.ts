import type {
  PartialListTargetDescriptorV6,
  PartialPrimitiveTargetDescriptorV6,
  PartialRangeTargetDescriptorV6,
} from "./PartialTargetDescriptorV6.types";

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
type InsertionMode = "before" | "after" | "to";

interface PrimitiveDestinationDescriptor {
  type: "primitive";

  /**
   * The insertion mode to use when inserting relative to {@link target}.
   */
  insertionMode: InsertionMode;

  target:
    | PartialPrimitiveTargetDescriptorV6
    | PartialRangeTargetDescriptorV6
    | PartialListTargetDescriptorV6;
}

/**
 * A list of destinations.  This is used when the user uses more than one insertion mode
 * in a single command.  For example, `"bring air after bat and before cap"`.
 */
interface ListDestinationDescriptor {
  type: "list";
  destinations: PrimitiveDestinationDescriptor[];
}

/**
 * An implicit destination.  This is used for e.g. `"bring air"` (note the user
 * doesn't explicitly specify the destination), or `"snip funk"`.
 */
interface ImplicitDestinationDescriptor {
  type: "implicit";
}

export type DestinationDescriptorV6 =
  | ListDestinationDescriptor
  | PrimitiveDestinationDescriptor
  | ImplicitDestinationDescriptor;
