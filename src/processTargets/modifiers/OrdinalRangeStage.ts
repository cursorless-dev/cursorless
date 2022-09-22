import { Range } from "vscode";
import { SUBWORD_MATCHER } from "../../core/constants";
import { GRAPHEME_SPLIT_REGEX } from "../../core/TokenGraphemeSplitter";
import { NoContainingScopeError } from "../../errors";
import type { Target } from "../../typings/target.types";
import type { OrdinalRangeModifier } from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import getModifierStage from "../getModifierStage";
import type { ModifierStage } from "../PipelineStages.types";
import { PlainTarget, SubTokenWordTarget } from "../targets";
import { getTokenRangeForSelection } from "./scopeTypeStages/TokenStage";

export default class OrdinalRangeStage implements ModifierStage {
  constructor(private modifier: OrdinalRangeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const isSubTokenType = ["word", "character"].includes(
      this.modifier.scopeType.type
    );
    return [
      isSubTokenType
        ? this.runSubToken(target)
        : this.runEveryScope(context, target),
    ];
  }

  private runEveryScope(
    context: ProcessedTargetsContext,
    target: Target
  ): Target {
    const containingStage = getModifierStage({
      type: "everyScope",
      scopeType: this.modifier.scopeType,
    });
    const targets = containingStage.run(context, target);

    const { relativeStartIndex, relativeEndIndex } = (() => {
      if (this.modifier.isRelative) {
        const relativeStartIndex = targets.findIndex((t) =>
          t.contentRange.contains(target.contentRange.start)
        );
        const relativeEndIndex = targets.findIndex((t) =>
          t.contentRange.contains(target.contentRange.end)
        );
        if (relativeStartIndex < 0 || relativeEndIndex < 0) {
          throw new NoContainingScopeError(this.modifier.scopeType.type);
        }
        return { relativeStartIndex, relativeEndIndex };
      }
      return { relativeStartIndex: undefined, relativeEndIndex: undefined };
    })();

    const { startIndex, endIndex, isReversed } = this.getParameters(
      target,
      targets.length,
      relativeStartIndex,
      relativeEndIndex
    );

    // Single target
    if (startIndex === endIndex) {
      return targets[startIndex];
    }

    // Continuous range target
    const startTarget = targets[startIndex];
    const endTarget = targets[endIndex];

    return startTarget.createContinuousRangeTarget(
      isReversed,
      endTarget,
      true,
      true
    );
  }

  private runSubToken(target: Target): Target {
    if (this.modifier.isRelative) {
      throw new Error("Sub token relative ordinal range is unsupported");
    }

    const { editor } = target;
    // If the target has an explicit range use that. Otherwise expand to the token.
    const textRange = target.hasExplicitRange
      ? target.contentRange
      : getTokenRangeForSelection(target.editor, target.contentRange);

    const regex =
      this.modifier.scopeType.type === "word"
        ? SUBWORD_MATCHER
        : GRAPHEME_SPLIT_REGEX;

    const text = editor.document.getText(textRange);
    const pieces = [...text.matchAll(regex)].map((match) => ({
      start: match.index!,
      end: match.index! + match[0].length,
    }));

    const { startIndex, endIndex, isReversed } = this.getParameters(
      target,
      pieces.length,
      undefined,
      undefined
    );

    const start = textRange.start.translate(
      undefined,
      pieces[startIndex].start
    );
    const end = textRange.start.translate(undefined, pieces[endIndex].end);

    const contentRange = new Range(start, end);

    if (this.modifier.scopeType.type === "character") {
      return new PlainTarget({
        editor,
        isReversed,
        contentRange,
      });
    }

    const leadingDelimiterRange =
      startIndex > 0 && pieces[startIndex - 1].end < pieces[startIndex].start
        ? new Range(
            textRange.start.translate({
              characterDelta: pieces[startIndex - 1].end,
            }),
            textRange.start.translate({
              characterDelta: pieces[startIndex].start,
            })
          )
        : undefined;
    const trailingDelimiterRange =
      endIndex + 1 < pieces.length &&
      pieces[endIndex].end < pieces[endIndex + 1].start
        ? new Range(
            textRange.start.translate({
              characterDelta: pieces[endIndex].end,
            }),
            textRange.start.translate({
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

    return new SubTokenWordTarget({
      editor,
      isReversed,
      contentRange,
      insertionDelimiter,
      leadingDelimiterRange,
      trailingDelimiterRange,
    });
  }

  private getParameters(
    target: Target,
    length: number,
    relativeStartIndex: number | undefined,
    relativeEndIndex: number | undefined
  ) {
    const { anchor, active, excludeAnchor, excludeActive } = this.modifier;

    const { isReversed, ...rest } = (() => {
      if (this.modifier.isRelative) {
        const isReversed = active < anchor;
        return {
          isReversed,
          startIndex: relativeStartIndex! + (isReversed ? active : anchor),
          endIndex: relativeEndIndex! + (isReversed ? anchor : active),
        };
      }

      const anchorIndex = anchor < 0 ? anchor + length : anchor;
      const activeIndex = active < 0 ? active + length : active;
      const isReversed = activeIndex < anchorIndex;
      return {
        isReversed,
        startIndex: isReversed ? activeIndex : anchorIndex,
        endIndex: isReversed ? anchorIndex : activeIndex,
      };
    })();

    const excludeStart = isReversed ? excludeActive : excludeAnchor;
    const excludeEnd = isReversed ? excludeAnchor : excludeActive;
    const startIndex = rest.startIndex + (excludeStart ? 1 : 0);
    const endIndex = rest.endIndex - (excludeEnd ? 1 : 0);

    if (
      startIndex < 0 ||
      endIndex < 0 ||
      startIndex >= length ||
      endIndex >= length
    ) {
      throw new Error("Ordinal index out of range");
    }
    // Omitting one or both ends can make the indices cross over.
    if (startIndex > endIndex) {
      throw new Error("Empty ordinal range");
    }

    return {
      startIndex,
      endIndex,
      // On single selection preserve input target is reversed
      isReversed: startIndex !== endIndex ? isReversed : target.isReversed,
    };
  }
}
