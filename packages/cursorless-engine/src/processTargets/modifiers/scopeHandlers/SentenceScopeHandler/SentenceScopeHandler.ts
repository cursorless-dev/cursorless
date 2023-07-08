import { Direction, Range } from "@cursorless/common";
import { imap } from "itertools";
import { NestedScopeHandler } from "..";
import { TokenTarget } from "../../../targets";
import type { TargetScope } from "../scope.types";
import SentenceSegmenter from "./SentenceSegmenter";

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

    const segmentToScope = (segment: Intl.SegmentData): TargetScope => {
      const contentRange = new Range(
        editor.document.positionAt(offset + segment.index),
        editor.document.positionAt(
          offset + segment.index + segment.segment.length,
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

    const segments = this.segmenter.segment(text);

    return direction === "forward"
      ? imap(segments, segmentToScope)
      : Array.from(segments, segmentToScope).reverse();
  }
}
