import { Direction, MatchedText, Range } from "@cursorless/common";
import { imap } from "itertools";
import { TokenTarget } from "../../../targets";
import { NestedScopeHandler } from "../NestedScopeHandler";
import type { TargetScope } from "../scope.types";
import { SentenceSegmenter } from "./SentenceSegmenter";

export class SentenceScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "sentence" } as const;
  public readonly iterationScopeType = { type: "paragraph" } as const;
  private segmenter = new SentenceSegmenter();

  protected generateScopesInSearchScope(
    direction: Direction,
    { editor, domain }: TargetScope,
  ): Iterable<TargetScope> {
    const offset = editor.document.offsetAt(domain.start);
    const text = editor.document.getText(domain);

    const sentenceToScope = (sentence: MatchedText): TargetScope => {
      const contentRange = new Range(
        editor.document.positionAt(offset + sentence.index),
        editor.document.positionAt(
          offset + sentence.index + sentence.text.length,
        ),
      );
      return {
        editor,
        domain: contentRange,
        getTargets: (isReversed) => [
          new TokenTarget({
            editor,
            contentRange,
            isReversed,
          }),
        ],
      };
    };

    const sentences = this.segmenter.segment(text);

    return direction === "forward"
      ? imap(sentences, sentenceToScope)
      : Array.from(sentences, sentenceToScope).reverse();
  }
}
