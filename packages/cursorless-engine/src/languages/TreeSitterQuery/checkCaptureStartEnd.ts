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

  const lastStart = captures
    .filter(({ name }) => name.endsWith(".start"))
    .map(({ range: { end } }) => end)
    .sort((a, b) => a.compareTo(b))
    .at(-1);
  const firstEnd = captures
    .filter(({ name }) => name.endsWith(".end"))
    .map(({ range: { start } }) => start)
    .sort((a, b) => a.compareTo(b))
    .at(0);
  if (lastStart != null && firstEnd != null) {
    if (lastStart.isAfter(firstEnd)) {
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
      `Please do not mix regular captures and start/end captures: ${captures.map(
        ({ name, range }) => name + "@" + range.toString(),
      )}`,
    );
    shownError = true;
  }

  if (regularCount > 1) {
    // Found duplicate captures
    showError(
      messages,
      "TreeSitterQuery.checkCaptures.duplicate",
      `A capture with the same name may only appear once in a single pattern: ${captures.map(
        ({ name, range }) => name + "@" + range.toString(),
      )}`,
    );
    shownError = true;
  }

  return !shownError;
}
