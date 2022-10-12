import { Position, Range, TextEditor } from "vscode";
import { getMatcher } from "../../../core/tokenizer";
import { Target } from "../../../typings/target.types";
import { getTokensInRange } from "../../../util/getTokensInRange";
import { expandToFullLine } from "../../../util/rangeUtils";
import { CommonTargetParameters, TokenTarget } from "../../targets";
import { ContainingIndices, Scope, ScopeHandler } from "./scopeHandler.types";

export default class TokenScopeHandler extends ScopeHandler {
  protected getEveryScope(editor: TextEditor, contentRange: Range): Scope[] {
    const tokens = getTokensInRange(
      editor,
      expandToFullLine(editor, contentRange)
    );
    return tokens.map((token) => ({
      domain: token.range,
      targetParameters: {
        contentRange: token.range,
      },
    }));
  }

  protected createTarget(parameters: CommonTargetParameters): Target {
    return new TokenTarget(parameters);
  }

  protected getContainingIndicesForPosition(
    position: Position,
    targets: Target[]
  ): ContainingIndices | undefined {
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
        const lengthDiff = textB.length - textA.length;
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
