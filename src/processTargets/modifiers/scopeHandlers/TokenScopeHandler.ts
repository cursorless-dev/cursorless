import { Range, TextEditor } from "vscode";
import { getMatcher } from "../../../core/tokenizer";
import { ScopeType } from "../../../typings/targetDescriptor.types";
import { getTokensInRange } from "../../../util/getTokensInRange";
import { TokenTarget } from "../../targets";
import LineScopeHandler from "./LineScopeHandler";
import NestedScopeHandler from "./NestedScopeHandler";
import { TargetScope } from "./scope.types";

export default class TokenScopeHandler extends NestedScopeHandler {
  constructor() {
    super(new LineScopeHandler());
  }

  get scopeType(): ScopeType {
    return { type: "token" };
  }

  protected getScopesInParentScope({
    editor,
    domain,
  }: TargetScope): TargetScope[] {
    return getTokensInRange(editor, domain).map(({ range }) => ({
      editor,
      domain: range,
      getTarget: (isReversed) =>
        new TokenTarget({
          editor,
          contentRange: range,
          isReversed,
        }),
      isPreferredOver(other) {
        return isPreferredOver(editor, range, other.domain);
      },
    }));
  }
}

/**
 * Determines whether token {@link a} is preferred over {@link b}.
 * @param editor The editor containing {@link a} and {@link b}
 * @param a A token range
 * @param b A token range
 * @returns `true` if token {@link a} is preferred over {@link b}; `false` if
 * token {@link b} is preferred over {@link a}; `undefined` otherwise
 */
function isPreferredOver(
  editor: TextEditor,
  a: Range,
  b: Range
): boolean | undefined {
  const { document } = editor;
  const { identifierMatcher } = getMatcher(document.languageId);

  // If multiple matches sort and take the first
  const textA = document.getText(a);
  const textB = document.getText(b);

  // First sort on identifier(alphanumeric)
  const aIsAlphaNum = identifierMatcher.test(textA);
  const bIsAlphaNum = identifierMatcher.test(textB);

  if (aIsAlphaNum && !bIsAlphaNum) {
    return true;
  }

  if (bIsAlphaNum && !aIsAlphaNum) {
    return false;
  }

  // Second sort on length
  const lengthDiff = textA.length - textB.length;
  if (lengthDiff !== 0) {
    return lengthDiff > 0 ? true : false;
  }

  // Otherwise no preference
  return undefined;
}
