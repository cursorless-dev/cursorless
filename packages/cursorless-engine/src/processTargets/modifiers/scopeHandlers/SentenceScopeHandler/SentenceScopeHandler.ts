import { Direction, Range } from "@cursorless/common";
import { imap } from "itertools";
import { NestedScopeHandler } from "..";
import { TokenTarget } from "../../../targets";
import type { TargetScope } from "../scope.types";
import SentenceSegmenter from "./SentenceSegmenter";
import { MatchedText } from "../../../../util/regex";

export default class SentenceScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "sentence" } as const;
  public readonly iterationScopeType = { type: "paragraph" } as const;
  private segmenter = new SentenceSegmenter();

  protected generateScopesInSearchScope(
    direction: Direction,
    { editor, domain }: TargetScope,
  ): Iterable<TargetScope> {
    const offset = editor.document.offsetAt(domain.start);
    const text = editor.document.getText(domain);

    const scentenceToScope = (sentence: MatchedText): TargetScope => {
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
      ? imap(sentences, scentenceToScope)
      : Array.from(sentences, scentenceToScope).reverse();
  }
}
