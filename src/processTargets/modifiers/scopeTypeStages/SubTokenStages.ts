import { Range } from "vscode";
import { GRAPHEME_SPLIT_REGEX } from "../../../core/TokenGraphemeSplitter";
import { NoContainingScopeError } from "../../../errors";
import { Target } from "../../../typings/target.types";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { matchAll } from "../../../util/regex";
import { ModifierStage } from "../../PipelineStages.types";
import { PlainTarget, SubTokenWordTarget } from "../../targets";
import { SUBWORD_MATCHER } from "../subToken";
import { getTokenRangeForSelection } from "./TokenStage";

abstract class SubTokenStage implements ModifierStage {
  constructor(
    private modifier: ContainingScopeModifier | EveryScopeModifier,
    private regex: RegExp
  ) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const { document } = target.editor;
    const tokenRange = getTokenRangeForSelection(
      target.editor,
      target.contentRange
    );
    const text = document.getText(tokenRange);
    const offset = document.offsetAt(tokenRange.start);

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

    return [this.findSingleTarget(target, filteredTargets)];
  }

  private findSingleTarget(target: Target, allTargets: Target[]): Target {
    let intersectingTargets = allTargets
      .map((t) => ({
        target: t,
        intersection: t.contentRange.intersection(target.contentRange),
      }))
      .filter((it) => it.intersection != null);

    // Empty range utilize single leftmost target
    if (target.contentRange.isEmpty) {
      return intersectingTargets[0].target;
    }

    // On non empty range utilize all non-empty intersecting targets
    intersectingTargets = intersectingTargets.filter(
      (it) => !it.intersection!.isEmpty
    );

    if (intersectingTargets.length === 1) {
      return intersectingTargets[0].target;
    }

    return intersectingTargets[0].target.createContinuousRangeTarget(
      target.isReversed,
      intersectingTargets.at(-1)!.target,
      true,
      true
    );
  }

  /**
   * Create new target for each content range
   */
  protected abstract createTargets(
    target: Target,
    contentRanges: Range[]
  ): Target[];
}

export class WordStage extends SubTokenStage {
  constructor(modifier: ContainingScopeModifier | EveryScopeModifier) {
    super(modifier, SUBWORD_MATCHER);
  }

  protected createTargets(target: Target, contentRanges: Range[]): Target[] {
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

  protected createTargets(target: Target, contentRanges: Range[]): Target[] {
    return contentRanges.map(
      (contentRange) =>
        new PlainTarget({
          editor: target.editor,
          isReversed: target.isReversed,
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
