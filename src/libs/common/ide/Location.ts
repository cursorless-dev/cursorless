import type { URI } from "vscode-uri";
import type Position from "./Position";
import { Range } from ".";

/**
 * Represents a location inside a resource, such as a line
 * inside a text file.
 */
export default class Location {
  /**
   * The resource identifier of this location.
   */
  readonly uri: URI;

  /**
   * The document range of this location.
   */
  readonly range: Range;

  /**
   * Creates a new location object.
   *
   * @param uri The resource identifier.
   * @param rangeOrPosition The range or position. Positions will be converted to an empty range.
   */
  constructor(uri: URI, rangeOrPosition: Range | Position) {
    this.uri = uri;
    this.range =
      "start" in rangeOrPosition
        ? rangeOrPosition
        : new Range(rangeOrPosition, rangeOrPosition);
  }
}
