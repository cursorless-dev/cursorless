import { Range } from "@cursorless/common";

interface SerializeHeaderArg {
  prefix?: string;
  header: string | undefined;
  scopeNumber: number | undefined;
  targetNumber: number | undefined;
  range?: Range;
}

/**
 * Constructs a header string from a configuration object. For example:
 *
 * ```
 * serializeHeader({
 *  prefix: "Leading delimiter",
 *  header: "Content",
 *  scopeNumber: 1,
 *  targetNumber: 2,
 *  range: new Range(new Position(1, 2), new Position(3, 4)),
 * }) === "[#1.2 Leading delimiter: Content] = 1:2-3:4"
 * ```
 *
 * @param param A configuration object
 * @returns A string representing the header
 */
export function serializeHeader({
  prefix,
  header,
  scopeNumber,
  targetNumber,
  range,
}: SerializeHeaderArg): string {
  const parts: string[] = [];
  if (scopeNumber != null || targetNumber != null) {
    const numberParts: string[] = ["#"];
    if (scopeNumber != null) {
      numberParts.push(scopeNumber.toString());
    }
    if (targetNumber != null) {
      numberParts.push(`.${targetNumber}`);
    }
    parts.push(numberParts.join(""));
  }

  if (prefix != null) {
    if (header != null) {
      parts.push(prefix + ":");
    } else {
      parts.push(prefix);
    }
  }

  if (header != null) {
    parts.push(header);
  }

  const suffix = range != null ? ` ${range}` : "";
  return `[${parts.join(" ")}] =${suffix}`;
}
