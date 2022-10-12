import { Range, TextEditor } from "vscode";
import { GRAPHEME_SPLIT_REGEX } from "../../../core/TokenGraphemeSplitter";
import { NoContainingScopeError } from "../../../errors";
import { Target } from "../../../typings/target.types";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { MatchedText, matchText } from "../../../util/regex";
import { ModifierStage } from "../../PipelineStages.types";
import { PlainTarget, SubTokenWordTarget } from "../../targets";
import { getTokenRangeForSelection } from "../scopeHandlers/TokenScopeHandler";
import { subWordSplitter } from "../subToken";

abstract class SubTokenStage implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const { document } = target.editor;
    const tokenRange = getTokenRangeForSelection(
      target.editor,
      target.contentRange
    );
    const text = document.getText(tokenRange);
    const offset = document.offsetAt(tokenRange.start);
    const matches = this.getMatchedText(text, document.languageId);
    const contentRanges = matches.map(
      (match) =>
        new Range(
          document.positionAt(offset + match.index),
          document.positionAt(offset + match.index + match.text.length)
        )
    );

    const targets = this.createTargetsFromRanges(
      target.isReversed,
      target.editor,
      contentRanges
    );

    // If target has explicit range filter to scopes in that range. Otherwise expand to all scopes in iteration scope.
    const filteredTargets = target.hasExplicitRange
      ? filterTargets(target, targets)
      : targets;

    if (filteredTargets.length === 0) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    if (this.modifier.type === "everyScope") {
      return filteredTargets;
    }

    return [this.getSingleTarget(target, filteredTargets)];
  }

  /**
   * Constructs a single range target containing all targets from
   * {@link allTargets} that intersect with {@link inputTarget}.
   * @param inputTarget The input target to this stage
   * @param allTargets A list of all targets under consideration
   * @returns A single target constructed by forming a range containing all
   * targets that intersect with {@link inputTarget}
   */
  private getSingleTarget(inputTarget: Target, allTargets: Target[]): Target {
    let intersectingTargets = allTargets
      .map((t) => ({
        target: t,
        intersection: t.contentRange.intersection(inputTarget.contentRange),
      }))
      .filter((it) => it.intersection != null);

    if (intersectingTargets.length === 0) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    // Empty range utilize single adjacent target to the right of {@link inputTarget}
    if (inputTarget.contentRange.isEmpty) {
      return intersectingTargets.at(-1)!.target;
    }

    // On non empty input range, utilize all targets with a non-empty
    // intersection with {@link inputTarget}
    intersectingTargets = intersectingTargets.filter(
      (it) => !it.intersection!.isEmpty
    );

    if (intersectingTargets.length === 0) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    if (intersectingTargets.length === 1) {
      return intersectingTargets[0].target;
    }

    return intersectingTargets[0].target.createContinuousRangeTarget(
      inputTarget.isReversed,
      intersectingTargets.at(-1)!.target,
      true,
      true
    );
  }

  /**
   * Return matches for {@link text}
   */
  protected abstract getMatchedText(
    text: string,
    languageId: string
  ): MatchedText[];

  /**
   * Create one target for each element of {@link contentRanges}
   */
  protected abstract createTargetsFromRanges(
    isReversed: boolean,
    editor: TextEditor,
    contentRanges: Range[]
  ): Target[];
}

export class WordStage extends SubTokenStage {
  constructor(modifier: ContainingScopeModifier | EveryScopeModifier) {
    super(modifier);
  }

  protected getMatchedText(text: string, languageId: string): MatchedText[] {
    return subWordSplitter(text, languageId);
  }

  protected createTargetsFromRanges(
    isReversed: boolean,
    editor: TextEditor,
    contentRanges: Range[]
  ): Target[] {
    return contentRanges.map((contentRange, i) => {
      const previousContentRange = i > 0 ? contentRanges[i - 1] : null;
      const nextContentRange =
        i + 1 < contentRanges.length ? contentRanges[i + 1] : null;

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
    });
  }
}

export class CharacterStage extends SubTokenStage {
  constructor(modifier: ContainingScopeModifier | EveryScopeModifier) {
    super(modifier);
  }

  protected getMatchedText(text: string): MatchedText[] {
    return matchText(text, GRAPHEME_SPLIT_REGEX);
  }

  protected createTargetsFromRanges(
    isReversed: boolean,
    editor: TextEditor,
    contentRanges: Range[]
  ): Target[] {
    return contentRanges.map(
      (contentRange) =>
        new PlainTarget({
          editor,
          isReversed,
          contentRange,
        })
    );
  }
}

function filterTargets(target: Target, targets: Target[]): Target[] {
  return targets.filter((t) => {
    const intersection = t.contentRange.intersection(target.contentRange);
    return intersection != null && !intersection.isEmpty;
  });
}
