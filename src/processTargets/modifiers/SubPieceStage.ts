import { range } from "lodash";
import { Range } from "vscode";
import { SUBWORD_MATCHER } from "../../core/constants";
import { SubTokenModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: SubTokenModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target {
    const token = target.editor.document.getText(target.contentRange);
    let pieces: { start: number; end: number }[] = [];

    if (this.modifier.excludeActive || this.modifier.excludeAnchor) {
      throw new Error("Subtoken exclusions unsupported");
    }

    if (this.modifier.pieceType === "word") {
      pieces = [...token.matchAll(SUBWORD_MATCHER)].map((match) => ({
        start: match.index!,
        end: match.index! + match[0].length,
      }));
    } else if (this.modifier.pieceType === "character") {
      pieces = range(token.length).map((index) => ({
        start: index,
        end: index + 1,
      }));
    }

    const anchorIndex =
      this.modifier.anchor < 0
        ? this.modifier.anchor + pieces.length
        : this.modifier.anchor;
    const activeIndex =
      this.modifier.active < 0
        ? this.modifier.active + pieces.length
        : this.modifier.active;

    if (
      anchorIndex < 0 ||
      activeIndex < 0 ||
      anchorIndex >= pieces.length ||
      activeIndex >= pieces.length
    ) {
      throw new Error("Subtoken index out of range");
    }

    const isReversed = activeIndex < anchorIndex;

    const anchor = target.contentRange.start.translate(
      undefined,
      isReversed ? pieces[anchorIndex].end : pieces[anchorIndex].start
    );
    const active = target.contentRange.start.translate(
      undefined,
      isReversed ? pieces[activeIndex].start : pieces[activeIndex].end
    );
    const contentRange = new Range(anchor, active);

    const startIndex = Math.min(anchorIndex, activeIndex);
    const endIndex = Math.max(anchorIndex, activeIndex);
    const leadingDelimiterRange =
      startIndex > 0 && pieces[startIndex - 1].end < pieces[startIndex].start
        ? new Range(
            target.contentRange.start.translate({
              characterDelta: pieces[startIndex - 1].end,
            }),
            target.contentRange.start.translate({
              characterDelta: pieces[startIndex].start,
            })
          )
        : undefined;
    const trailingDelimiterRange =
      endIndex + 1 < pieces.length &&
      pieces[endIndex].end < pieces[endIndex + 1].start
        ? new Range(
            target.contentRange.start.translate({
              characterDelta: pieces[endIndex].end,
            }),
            target.contentRange.start.translate({
              characterDelta: pieces[endIndex + 1].start,
            })
          )
        : undefined;
    const isInDelimitedList =
      leadingDelimiterRange != null || trailingDelimiterRange != null;
    const containingListDelimiter = isInDelimitedList
      ? target.editor.document.getText(
          (leadingDelimiterRange ?? trailingDelimiterRange)!
        )
      : undefined;

    return {
      editor: target.editor,
      isReversed,
      contentRange,
      delimiter: containingListDelimiter,
      removal: {
        leadingDelimiterRange,
        trailingDelimiterRange,
      },
    };
  }
}
