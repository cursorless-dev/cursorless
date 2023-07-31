import {
  DestinationDescriptor,
  InsertionMode
} from "@cursorless/common";
import { RecursiveArray } from "lodash";
import { NoSpokenFormError } from "./NoSpokenFormError";
import { connectives } from "./defaultSpokenForms/connectives";
import { targetToSpokenForm } from "./targetToSpokenForm";

export function destinationToSpokenForm(
  destination: DestinationDescriptor): RecursiveArray<string> {
  switch (destination.type) {
    case "list":
      if (destination.destinations.length < 2) {
        throw new NoSpokenFormError("List destination with < 2 elements");
      }

      return destination.destinations.map((destination, i) => i === 0
        ? destinationToSpokenForm(destination)
        : [connectives.listConnective, destinationToSpokenForm(destination)]
      );

    case "primitive":
      return [
        insertionModeToSpokenForm(destination.insertionMode),
        targetToSpokenForm(destination.target),
      ];

    case "implicit":
      return [];
  }
}

function insertionModeToSpokenForm(insertionMode: InsertionMode): string {
  switch (insertionMode) {
    case "to":
      return connectives.sourceDestinationConnective;
    case "before":
      return connectives.before;
    case "after":
      return connectives.after;
  }
}
