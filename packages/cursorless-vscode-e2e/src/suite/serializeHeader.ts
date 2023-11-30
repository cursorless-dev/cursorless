import { Range } from "@cursorless/common";

interface SerializeHeaderArg {
  prefix?: string;
  header: string | undefined;
  scopeIndex: number | undefined;
  targetIndex: number | undefined;
  range?: Range;
}

/**
 * Constructs a header string from a configuration object. For example:
 *
 * ```
 * serializeHeader({
 *  prefix: "Leading delimiter",
 *  header: "Content",
 *  scopeIndex: 1,
 *  targetIndex: 2,
 *  range: new Range(new Position(1, 2), new Position(3, 4)),
 * }) === "[#1 Leading delimiter: Content 2] =1:2-3:4"
 * ```
 *
 * @param param A configuration object
 * @returns A string representing the header
 */
export function serializeHeader({
  prefix,
  header,
  scopeIndex,
  targetIndex,
  range,
}: SerializeHeaderArg): string {
  const parts: string[] = [];
  if (scopeIndex != null) {
    parts.push(`#${scopeIndex}`);
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
  if (targetIndex != null) {
    parts.push(targetIndex.toString());
  }
  const suffix = range != null ? ` ${range}` : "";
  return `[${parts.join(" ")}] =${suffix}`;
}
