import { QueryMatch } from "../../../../languages/TreeSitterQuery/QueryCapture";

/**
 * Gets a capture that is related to the scope.  For example, if the scope is
 * "class name", the `domain` node would be the containing class.
 *
 * @param match The match to get the range from
 * @param scopeTypeType The type of the scope
 * @param relationship The relationship to get the range for, eg "domain", or
 * "removal"
 * @param matchHasScopeType Set to `true` if this match is known to have a
 * capture for the given scope type
 * @returns A capture or undefined if no capture was found
 */
export function getRelatedCapture(
  match: QueryMatch,
  scopeTypeType: string,
  relationship: string,
  matchHasScopeType: boolean,
) {
  if (matchHasScopeType) {
    return findCaptureByName(
      match,
      `${scopeTypeType}.${relationship}`,
      `_.${relationship}`,
    );
  }

  return (
    findCaptureByName(match, `${scopeTypeType}.${relationship}`) ??
    (findCaptureByName(match, scopeTypeType) != null
      ? findCaptureByName(match, `_.${relationship}`)
      : undefined)
  );
}

/**
 * Gets the range of a node that is related to the scope.  For example, if the
 * scope is "class name", the `domain` node would be the containing class.
 *
 * @param match The match to get the range from
 * @param scopeTypeType The type of the scope
 * @param relationship The relationship to get the range for, eg "domain", or
 * "removal"
 * @param matchHasScopeType Set to `true` if this match is known to have a
 * capture for the given scope type
 * @returns A range or undefined if no range was found
 */
export function getRelatedRange(
  match: QueryMatch,
  scopeTypeType: string,
  relationship: string,
  matchHasScopeType: boolean,
) {
  return getRelatedCapture(
    match,
    scopeTypeType,
    relationship,
    matchHasScopeType,
  )?.range;
}

/**
 * Looks in the captures of a match for a capture with one of the given names, and
 * returns the range of that capture, or undefined if no matching capture was found
 *
 * @param match The match to get the range from
 * @param names The possible names of the capture to get the range for
 * @returns A range or undefined if no matching capture was found
 */
export function findCaptureRangeByName(match: QueryMatch, ...names: string[]) {
  return findCaptureByName(match, ...names)?.range;
}

/**
 * Looks in the captures of a match for a capture with one of the given names, and
 * returns that capture, or undefined if no matching capture was found
 *
 * @param match The match to get the range from
 * @param names The possible names of the capture to get the range for
 * @returns A range or undefined if no matching capture was found
 */
export function findCaptureByName(match: QueryMatch, ...names: string[]) {
  return match.captures.find((capture) =>
    names.some((name) => capture.name === name),
  );
}
