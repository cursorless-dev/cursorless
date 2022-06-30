import { Range, TextEditor } from "vscode";
import { NoContainingScopeError } from "../../../errors";
import { Target } from "../../../typings/target.types";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
  SimpleScopeTypeType,
} from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { getInsertionDelimiter } from "../../../util/nodeSelectors";
import { rangeLength } from "../../../util/rangeUtils";
import { ModifierStage } from "../../PipelineStages.types";
import ScopeTypeTarget from "../../targets/ScopeTypeTarget";
import ContainingSyntaxScopeStage, {
  SimpleContainingScopeModifier,
} from "../scopeTypeStages/ContainingSyntaxScopeStage";
import { getIterationScope } from "./getIterationScope";
import { tokenizeRange } from "./tokenizeRange";

export default class ItemStage implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    // First try the language specific implementation of item
    try {
      return new ContainingSyntaxScopeStage(
        <SimpleContainingScopeModifier>this.modifier
      ).run(context, target);
    } catch (_error) {}

    // Then try the textual implementation
    if (this.modifier.type === "everyScope") {
      return this.getEveryTarget(context, target);
    }
    return [this.getSingleTarget(context, target)];
  }

  private getEveryTarget(context: ProcessedTargetsContext, target: Target) {
    const itemInfos = getItemInfosForIterationScope(context, target);

    if (itemInfos.length === 0) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    return itemInfos.map((itemInfo) => this.itemInfoToTarget(target, itemInfo));
  }

  private getSingleTarget(context: ProcessedTargetsContext, target: Target) {
    const itemInfos = getItemInfosForIterationScope(context, target);

    const itemInfoWithIntersections = itemInfos
      .map((itemInfo) => ({
        itemInfo,
        intersection: itemInfo.domain.intersection(target.contentRange),
      }))
      .filter((e) => e.intersection != null);

    if (itemInfoWithIntersections.length === 0) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    itemInfoWithIntersections.sort(
      (a, b) =>
        rangeLength(target.editor, b.intersection!) -
        rangeLength(target.editor, a.intersection!)
    );

    return this.itemInfoToTarget(target, itemInfoWithIntersections[0].itemInfo);
  }

  private itemInfoToTarget(target: Target, itemInfo: ItemInfo) {
    const delimiter = getInsertionDelimiter(
      target.editor,
      itemInfo.leadingDelimiterRange,
      itemInfo.trailingDelimiterRange,
      ", "
    );
    return new ScopeTypeTarget({
      scopeTypeType: <SimpleScopeTypeType>this.modifier.scopeType.type,
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange: itemInfo.contentRange,
      delimiter,
      leadingDelimiterRange: itemInfo.leadingDelimiterRange,
      trailingDelimiterRange: itemInfo.trailingDelimiterRange,
    });
  }
}

function getItemInfosForIterationScope(
  context: ProcessedTargetsContext,
  target: Target
) {
  // It's only for week targets we expand to iteration scope
  const { range, boundary } = target.isWeak
    ? getIterationScope(context, target)
    : { range: target.contentRange, boundary: undefined };
  return rangeToItemInfos(target.editor, range, boundary);
}

function rangeToItemInfos(
  editor: TextEditor,
  collectionRange: Range,
  collectionBoundary?: [Range, Range]
): ItemInfo[] {
  const tokens = tokenizeRange(editor, collectionRange, collectionBoundary);
  const itemInfos: ItemInfo[] = [];

  tokens.forEach((token, i) => {
    if (token.type === "delimiter" || token.type === "boundary") {
      return;
    }
    const leadingDelimiterRange = (() => {
      if (tokens[i - 2]?.type === "item") {
        return new Range(tokens[i - 2].range.end, token.range.start);
      }
      if (tokens[i - 1]?.type === "delimiter") {
        return new Range(tokens[i - 1].range.start, token.range.start);
      }
      return undefined;
    })();
    const trailingDelimiterRange = (() => {
      if (tokens[i + 2]?.type === "item") {
        return new Range(token.range.end, tokens[i + 2].range.start);
      }
      if (tokens[i + 1]?.type === "delimiter") {
        return new Range(token.range.end, tokens[i + 1].range.end);
      }
      return undefined;
    })();
    // Leading boundary is excluded and leading delimiter is included
    const leadingMatchStart =
      tokens[i - 1]?.type === "boundary"
        ? tokens[i - 1].range.end
        : tokens[i - 1]?.type === "delimiter"
        ? tokens[i - 1].range.start
        : token.range.start;
    // Trailing boundary and delimiter is excluded
    const trailingMatchEnd =
      tokens[i + 1]?.type === "boundary" || tokens[i + 1]?.type === "delimiter"
        ? tokens[i + 1].range.start
        : token.range.end;
    const matchRange = new Range(leadingMatchStart, trailingMatchEnd);
    itemInfos.push({
      contentRange: token.range,
      leadingDelimiterRange,
      trailingDelimiterRange,
      domain: matchRange,
    });
  });

  return itemInfos;
}

interface ItemInfo {
  contentRange: Range;
  leadingDelimiterRange?: Range;
  trailingDelimiterRange?: Range;
  domain: Range;
}
