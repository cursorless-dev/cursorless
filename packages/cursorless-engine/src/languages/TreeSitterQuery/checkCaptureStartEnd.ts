import { Messages, showError } from "@cursorless/common";
import { QueryCapture } from "./QueryCapture";

/**
 * Checks the captures for a single name to ensure that they are valid.  Detects
 * errors like start appearing before end, the same capture appearing twice, etc.
 * @param captures A list of captures with the same name
 * @param messages The messages object for displaying messages to the user
 * @returns `true` if the captures are valid
 */
export function checkCaptureStartEnd(
  captures: QueryCapture[],
  messages: Messages,
): boolean {
  if (captures.length === 1) {
    // Could be one of the following:
    //
    // - `["@foo"]`
    // - `["@foo.start"]
    // - `["@foo.end"]
    //
    // These are all considered fine, as the latter two are assumed to mean that
    // the other endpoint wasn't matched, so we just use the range of the endpoint
    // that did match
    return true;
  }

  let shownError = false;

  if (captures.length === 2) {
    const startRange = captures.find(({ name }) =>
      name.endsWith(".start"),
    )?.range;
    const endRange = captures.find(({ name }) => name.endsWith(".end"))?.range;
    if (startRange != null && endRange != null) {
      if (startRange.end.isBeforeOrEqual(endRange.start)) {
        // Found just a start and endpoint in the right order, so we're good
        return true;
      }

      showError(
        messages,
        "TreeSitterQuery.checkCaptures.badOrder",
        `Start capture must be before end capture: ${captures}`,
      );
      shownError = true;
    }
  }

  const startCount = captures.filter(({ name }) =>
    name.endsWith(".start"),
  ).length;
  const endCount = captures.filter(({ name }) => name.endsWith(".end")).length;
  const regularCount = captures.length - startCount - endCount;

  if (regularCount > 0 && (startCount > 0 || endCount > 0)) {
    // Found a mix of regular captures and start/end captures, which is not
    // allowed
    showError(
      messages,
      "TreeSitterQuery.checkCaptures.mixRegularStartEnd",
      `Please do not mix regular captures and start/end captures: ${captures}`,
    );
    shownError = true;
  }

  if (regularCount > 1 || startCount > 1 || endCount > 1) {
    // Found duplicate captures
    showError(
      messages,
      "TreeSitterQuery.checkCaptures.duplicate",
      `A capture with the same name may only appear once in a single pattern: ${captures.map(({ name }) => name)}`,
    );
    shownError = true;
  }

  if (!shownError) {
    // I don't think it's possible to get here, but just in case, show a generic
    // error message
    showError(
      messages,
      "TreeSitterQuery.checkCaptures.unexpected",
      `Unexpected captures: ${captures}`,
    );
  }

  return false;
}
