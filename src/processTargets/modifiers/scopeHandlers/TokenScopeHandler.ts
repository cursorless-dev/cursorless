import { Range, TextEditor } from "vscode";
import { getMatcher } from "../../../core/tokenizer";
import { Target } from "../../../typings/target.types";
import { ScopeType } from "../../../typings/targetDescriptor.types";
import { TokenTarget } from "../../targets";
import BaseRegexScopeHandler from "./BaseRegexScopeHandler";
import LineScopeHandler from "./LineScopeHandler";
import { TargetScope } from "./scopeHandler.types";

export default class TokenScopeHandler extends BaseRegexScopeHandler {
  constructor() {
    super(new LineScopeHandler());
  }

  get scopeType(): ScopeType {
    return { type: "token" };
  }

  protected getRegex(editor: TextEditor, _domain: Range) {
    return getMatcher(editor.document.languageId).tokenMatcher;
  }

  protected isPreferredOver(
    editor: TextEditor,
    scope1: TargetScope,
    scope2: TargetScope
  ): boolean | undefined {
    return isPreferredOver(editor, scope1.domain, scope2.domain);
  }

  protected constructTarget(
    isReversed: boolean,
    editor: TextEditor,
    contentRange: Range
  ): Target {
    return new TokenTarget({
      editor,
      contentRange,
      isReversed,
    });
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
