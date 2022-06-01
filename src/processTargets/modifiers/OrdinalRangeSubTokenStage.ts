import { range } from "lodash";
import { Range } from "vscode";
import { SUBWORD_MATCHER } from "../../core/constants";
import {
  OrdinalRangeModifier,
  SimpleScopeType,
  Target,
} from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import PlainTarget from "../targets/PlainTarget";
import SubTokenWordTarget from "../targets/SubTokenWordTarget";
import { getTokenRangeForSelection } from "./scopeTypeStages/TokenStage";

interface OrdinalScopeType extends SimpleScopeType {
  type: "character" | "word";
}

export interface OrdinalRangeSubTokenModifier extends OrdinalRangeModifier {
  scopeType: OrdinalScopeType;
}

export default class OrdinalRangeSubTokenStage implements ModifierStage {
  constructor(private modifier: OrdinalRangeSubTokenModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const { editor } = target;
    const tokenContentRange = target.contentRange.isEmpty
      ? getTokenRangeForSelection(target.editor, target.contentRange)
      : target.contentRange;

    const tokenText = editor.document.getText(tokenContentRange);
    let pieces: { start: number; end: number }[] = [];

    if (this.modifier.excludeActive || this.modifier.excludeAnchor) {
      throw new Error("Subtoken exclusions unsupported");
    }

    if (this.modifier.scopeType.type === "word") {
      pieces = [...tokenText.matchAll(SUBWORD_MATCHER)].map((match) => ({
        start: match.index!,
        end: match.index! + match[0].length,
      }));
    } else if (this.modifier.scopeType.type === "character") {
      pieces = range(tokenText.length).map((index) => ({
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

    const anchor = tokenContentRange.start.translate(
      undefined,
      isReversed ? pieces[anchorIndex].end : pieces[anchorIndex].start
    );
    const active = tokenContentRange.start.translate(
      undefined,
      isReversed ? pieces[activeIndex].start : pieces[activeIndex].end
    );

    const contentRange = new Range(anchor, active);

    if (this.modifier.scopeType.type === "character") {
      return [
        new PlainTarget({
          editor,
          isReversed,
          contentRange,
        }),
      ];
    }

    const startIndex = Math.min(anchorIndex, activeIndex);
    const endIndex = Math.max(anchorIndex, activeIndex);
    const leadingDelimiterRange =
      startIndex > 0 && pieces[startIndex - 1].end < pieces[startIndex].start
        ? new Range(
            tokenContentRange.start.translate({
              characterDelta: pieces[startIndex - 1].end,
            }),
            tokenContentRange.start.translate({
              characterDelta: pieces[startIndex].start,
            })
          )
        : undefined;
    const trailingDelimiterRange =
      endIndex + 1 < pieces.length &&
      pieces[endIndex].end < pieces[endIndex + 1].start
        ? new Range(
            tokenContentRange.start.translate({
              characterDelta: pieces[endIndex].end,
            }),
            tokenContentRange.start.translate({
              characterDelta: pieces[endIndex + 1].start,
            })
          )
        : undefined;
    const isInDelimitedList =
      leadingDelimiterRange != null || trailingDelimiterRange != null;
    const insertionDelimiter = isInDelimitedList
      ? editor.document.getText(
          (leadingDelimiterRange ?? trailingDelimiterRange)!
        )
      : "";

    return [
      new SubTokenWordTarget({
        editor,
        isReversed,
        contentRange,
        insertionDelimiter,
        leadingDelimiterRange,
        trailingDelimiterRange,
      }),
    ];
  }
}
