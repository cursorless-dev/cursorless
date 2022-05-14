import { range } from "lodash";
import { Range } from "vscode";
import { SUBWORD_MATCHER } from "../../core/constants";
import { SubTokenModifier } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  run(
    context: ProcessedTargetsContext,
    stage: SubTokenModifier,
    selection: TypedSelection
  ): TypedSelection {
    const token = selection.editor.document.getText(selection.contentRange);
    let pieces: { start: number; end: number }[] = [];

    if (stage.excludeActive || stage.excludeAnchor) {
      throw new Error("Subtoken exclusions unsupported");
    }

    if (stage.pieceType === "word") {
      pieces = [...token.matchAll(SUBWORD_MATCHER)].map((match) => ({
        start: match.index!,
        end: match.index! + match[0].length,
      }));
    } else if (stage.pieceType === "character") {
      pieces = range(token.length).map((index) => ({
        start: index,
        end: index + 1,
      }));
    }

    const anchorIndex =
      stage.anchor < 0 ? stage.anchor + pieces.length : stage.anchor;
    const activeIndex =
      stage.active < 0 ? stage.active + pieces.length : stage.active;

    if (
      anchorIndex < 0 ||
      activeIndex < 0 ||
      anchorIndex >= pieces.length ||
      activeIndex >= pieces.length
    ) {
      throw new Error("Subtoken index out of range");
    }

    const isReversed = activeIndex < anchorIndex;

    const anchor = selection.contentRange.start.translate(
      undefined,
      isReversed ? pieces[anchorIndex].end : pieces[anchorIndex].start
    );
    const active = selection.contentRange.start.translate(
      undefined,
      isReversed ? pieces[activeIndex].start : pieces[activeIndex].end
    );

    const startIndex = Math.min(anchorIndex, activeIndex);
    const endIndex = Math.max(anchorIndex, activeIndex);
    const leadingDelimiterRange =
      startIndex > 0 && pieces[startIndex - 1].end < pieces[startIndex].start
        ? new Range(
            selection.contentRange.start.translate({
              characterDelta: pieces[startIndex - 1].end,
            }),
            selection.contentRange.start.translate({
              characterDelta: pieces[startIndex].start,
            })
          )
        : undefined;
    const trailingDelimiterRange =
      endIndex + 1 < pieces.length &&
      pieces[endIndex].end < pieces[endIndex + 1].start
        ? new Range(
            selection.contentRange.start.translate({
              characterDelta: pieces[endIndex].end,
            }),
            selection.contentRange.start.translate({
              characterDelta: pieces[endIndex + 1].start,
            })
          )
        : undefined;
    const isInDelimitedList =
      leadingDelimiterRange != null || trailingDelimiterRange != null;
    const containingListDelimiter = isInDelimitedList
      ? selection.editor.document.getText(
          (leadingDelimiterRange ?? trailingDelimiterRange)!
        )
      : undefined;

    return {
      ...selection,
      isReversed,
      delimiter: containingListDelimiter ?? undefined,
      leadingDelimiterRange,
      trailingDelimiterRange,
      contentRange: new Range(anchor, active),
    };
  }
}
