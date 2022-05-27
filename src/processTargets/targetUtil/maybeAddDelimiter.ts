import { Position } from "../../typings/target.types";

/** Possibly add delimiter for positions before/after */
export function maybeAddDelimiter(
  text: string,
  delimiter?: string,
  position?: Position
): string {
  if (delimiter != null) {
    if (position === "before") {
      return text + delimiter;
    }
    if (position === "after") {
      return delimiter + text;
    }
  }
  return text;
}
