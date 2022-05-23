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
import ScopeTypeTarget from "../targets/ScopeTypeTarget";
import { getTokenRangeForSelection } from "./scopeTypeStages/TokenStage";

interface OrdinalScopeType extends SimpleScopeType {
  type: "character" | "word";
}

export interface OrdinalRangeSubTokenModifier extends OrdinalRangeModifier {
  scopeType: OrdinalScopeType;
}

export default class implements ModifierStage {
  constructor(private modifier: OrdinalRangeSubTokenModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const { editor } = target;
    const contentRange = target.contentRange.isEmpty
      ? getTokenRangeForSelection(target.editor, target.contentRange)
      : target.contentRange;

    const token = editor.document.getText(contentRange);
    let pieces: { start: number; end: number }[] = [];

    if (this.modifier.excludeActive || this.modifier.excludeAnchor) {
      throw new Error("Subtoken exclusions unsupported");
    }

    if (this.modifier.scopeType.type === "word") {
      pieces = [...token.matchAll(SUBWORD_MATCHER)].map((match) => ({
        start: match.index!,
        end: match.index! + match[0].length,
      }));
    } else if (this.modifier.scopeType.type === "character") {
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

    const anchor = contentRange.start.translate(
      undefined,
      isReversed ? pieces[anchorIndex].end : pieces[anchorIndex].start
    );
    const active = contentRange.start.translate(
      undefined,
      isReversed ? pieces[activeIndex].start : pieces[activeIndex].end
    );

    const startIndex = Math.min(anchorIndex, activeIndex);
    const endIndex = Math.max(anchorIndex, activeIndex);
    const leadingDelimiterRange =
      startIndex > 0 && pieces[startIndex - 1].end < pieces[startIndex].start
        ? new Range(
            contentRange.start.translate({
              characterDelta: pieces[startIndex - 1].end,
            }),
            contentRange.start.translate({
              characterDelta: pieces[startIndex].start,
            })
          )
        : undefined;
    const trailingDelimiterRange =
      endIndex + 1 < pieces.length &&
      pieces[endIndex].end < pieces[endIndex + 1].start
        ? new Range(
            contentRange.start.translate({
              characterDelta: pieces[endIndex].end,
            }),
            contentRange.start.translate({
              characterDelta: pieces[endIndex + 1].start,
            })
          )
        : undefined;
    const isInDelimitedList =
      leadingDelimiterRange != null || trailingDelimiterRange != null;
    const containingListDelimiter = isInDelimitedList
      ? editor.document.getText(
          (leadingDelimiterRange ?? trailingDelimiterRange)!
        )
      : undefined;

    return [
      new ScopeTypeTarget({
        editor,
        isReversed,
        contentRange: new Range(anchor, active),
        scopeTypeType: this.modifier.scopeType.type,
        delimiter: containingListDelimiter ?? "",
        leadingDelimiter:
          leadingDelimiterRange != null
            ? { range: leadingDelimiterRange }
            : undefined,
        trailingDelimiter:
          trailingDelimiterRange != null
            ? { range: trailingDelimiterRange }
            : undefined,
      }),
    ];
  }
}
