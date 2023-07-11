import {
  InsertionMode,
  PartialListTargetDescriptor,
  PartialPrimitiveTargetDescriptor,
  PartialRangeTargetDescriptor,
} from "./PartialTargetDescriptor.types";

export interface PrimitiveDestinationDescriptor {
  type: "primitive";
  insertionMode: InsertionMode;
  target:
    | PartialPrimitiveTargetDescriptor
    | PartialRangeTargetDescriptor
    | PartialListTargetDescriptor;
}

export interface ListDestinationDescriptor {
  type: "list";
  destinations: PrimitiveDestinationDescriptor[];
}

export interface ImplicitDestinationDescriptor {
  type: "implicit";
}

export type DestinationDescriptor =
  | ListDestinationDescriptor
  | PrimitiveDestinationDescriptor
  | ImplicitDestinationDescriptor;
