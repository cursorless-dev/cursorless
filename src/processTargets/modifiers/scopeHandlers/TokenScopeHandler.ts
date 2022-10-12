import { Position, Range, TextEditor } from "vscode";
import { getMatcher } from "../../../core/tokenizer";
import { Target } from "../../../typings/target.types";
import { getTokensInRange } from "../../../util/getTokensInRange";
import { expandToFullLine } from "../../../util/rangeUtils";
import { TokenTarget } from "../../targets";
import { ContainedIndices, ScopeHandler } from "./scopeHandler.types";

export default class TokenScopeHandler extends ScopeHandler {
  protected getEveryTarget(
    editor: TextEditor,
    contentRange: Range,
    isReversed: boolean,
    hasExplicitRange: boolean
  ): Target[] {
    const tokenRanges = getTokensInRange(
      editor,
      expandToFullLine(editor, contentRange)
    ).map(({ range }) => range);

    const filteredTokenRanges = hasExplicitRange
      ? this.filterRangesByIterationScope(contentRange, tokenRanges)
      : tokenRanges;

    return filteredTokenRanges.map(
      (contentRange) =>
        new TokenTarget({
          editor,
          isReversed,
          contentRange,
        })
    );
  }

  protected getContainingIndicesForPosition(
    position: Position,
    targets: Target[]
  ): ContainedIndices | undefined {
    const mappings = targets
      .map((target, index) => ({ target, index }))
      .filter((mapping) => mapping.target.contentRange.contains(position));

    if (mappings.length === 0) {
      return undefined;
    }

    if (mappings.length > 1) {
      const languageId = mappings[0].target.editor.document.languageId;
      const { identifierMatcher } = getMatcher(languageId);

      // If multiple matches sort and take the first
      mappings.sort(({ target: a }, { target: b }) => {
        const textA = a.contentText;
        const textB = b.contentText;

        // First sort on identifier(alphanumeric)
        const aIsAlphaNum = identifierMatcher.test(textA);
        const bIsAlphaNum = identifierMatcher.test(textB);
        if (aIsAlphaNum && !bIsAlphaNum) {
          return -1;
        }
        if (bIsAlphaNum && !aIsAlphaNum) {
          return 1;
        }
        // Second sort on length
        const lengthDiff = textA.length - textB.length;
        if (lengthDiff !== 0) {
          return lengthDiff;
        }
        // Lastly sort on start position in reverse. ie prefer rightmost
        return b.contentRange.start.compareTo(a.contentRange.start);
      });
    }

    const index = mappings[0].index;

    return { start: index, end: index };
  }
}
