import { testRegex } from "../../../util/regex";
import type { TargetScope } from "./scope.types";

export function isPreferredOverHelper(
  scopeA: TargetScope,
  scopeB: TargetScope,
  matchers: RegExp[],
): boolean | undefined {
  const {
    editor: { document },
  } = scopeA;
  const textA = document.getText(scopeA.domain);
  const textB = document.getText(scopeB.domain);

  for (const matcher of matchers) {
    // NB: Don't directly use `test` here because global regexes are stateful
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
    const aMatchesRegex = testRegex(matcher, textA);
    const bMatchesRegex = testRegex(matcher, textB);

    if (aMatchesRegex && !bMatchesRegex) {
      return true;
    }

    if (bMatchesRegex && !aMatchesRegex) {
      return false;
    }
  }

  return undefined;
}
