import { Range } from "vscode";
import { SUBWORD_MATCHER } from "../../../core/constants";
import { GRAPHEME_SPLIT_REGEX } from "../../../core/TokenGraphemeSplitter";
import { Target } from "../../../typings/target.types";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { matchAll } from "../../../util/regex";
import { ModifierStage } from "../../PipelineStages.types";
import { PlainTarget, SubTokenWordTarget } from "../../targets";
import { getTokenRangeForSelection } from "./TokenStage";

abstract class SubTokenStage implements ModifierStage {
  constructor(
    private modifier: ContainingScopeModifier | EveryScopeModifier,
    private regex: RegExp
  ) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    // If the target has an explicit range use that. Otherwise expand to the token.
    const textRange = target.hasExplicitRange
      ? target.contentRange
      : getTokenRangeForSelection(target.editor, target.contentRange);

    const { document } = target.editor;
    const text = document.getText(textRange);
    const offset = document.offsetAt(textRange.start);

    const contentRanges = matchAll<Range>(
      text,
      this.regex,
      (match) =>
        new Range(
          document.positionAt(offset + match.index!),
          document.positionAt(offset + match.index! + match[0].length)
        )
    );

    const targets = this.createTargets(target, contentRanges);

    if (this.modifier.type === "everyScope") {
      return targets;
    }

    return [];
  }

  protected abstract createTargets(target: Target, ranges: Range[]): Target[];
}

export class WordStage extends SubTokenStage {
  constructor(modifier: ContainingScopeModifier | EveryScopeModifier) {
    super(modifier, SUBWORD_MATCHER);
  }

  protected createTargets(target: Target, ranges: Range[]): Target[] {
    return ranges.map((contentRange, i) => {
      const previousContentRange = i > 0 ? ranges[i - 1] : null;
      const nextContentRange = i + 1 < ranges.length ? ranges[i + 1] : null;

      const leadingDelimiterRange =
        previousContentRange != null &&
        contentRange.start.isAfter(previousContentRange.end)
          ? new Range(previousContentRange.end, contentRange.start)
          : undefined;

      const trailingDelimiterRange =
        nextContentRange != null &&
        nextContentRange.start.isAfter(contentRange.end)
          ? new Range(contentRange.end, nextContentRange.start)
          : undefined;

      const isInDelimitedList =
        leadingDelimiterRange != null || trailingDelimiterRange != null;
      const insertionDelimiter = isInDelimitedList
        ? target.editor.document.getText(
            (leadingDelimiterRange ?? trailingDelimiterRange)!
          )
        : "";

      return new SubTokenWordTarget({
        editor: target.editor,
        isReversed: target.isReversed,
        contentRange,
        insertionDelimiter,
        leadingDelimiterRange,
        trailingDelimiterRange,
      });
    });
  }
}

export class CharacterStage extends SubTokenStage {
  constructor(modifier: ContainingScopeModifier | EveryScopeModifier) {
    super(modifier, GRAPHEME_SPLIT_REGEX);
  }

  protected createTargets(target: Target, ranges: Range[]): Target[] {
    return ranges.map((contentRange) => {
      return new PlainTarget({
        editor: target.editor,
        isReversed: target.isReversed,
        contentRange,
      });
    });
  }
}
