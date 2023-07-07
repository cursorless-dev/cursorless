import { Direction, Range } from "@cursorless/common";
import { imap } from "itertools";
import { NestedScopeHandler } from ".";
import { trimRange } from "../../../util/rangeUtils";
import { TokenTarget } from "../../targets";
import type { TargetScope } from "./scope.types";

export default class SentenceScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "sentence" } as const;
  public readonly iterationScopeType = { type: "paragraph" } as const;

  protected generateScopesInSearchScope(
    direction: Direction,
    { editor, domain }: TargetScope,
  ): Iterable<TargetScope> {
    const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
    const offset = editor.document.offsetAt(domain.start);
    const text = editor.document.getText(domain);

    const segmentToRange = (segment: Intl.SegmentData) => {
      const range = new Range(
        editor.document.positionAt(offset + segment.index),
        editor.document.positionAt(
          offset + segment.index + segment.segment.length,
        ),
      );

      return trimRange(editor, range);
    };

    return imap(segmenter.segment(text), (segment) => {
      const contentRange = segmentToRange(segment);
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
    });
  }
}
