import {
  ContainingScopeModifier,
  EveryScopeModifier,
  NoContainingScopeError,
  Range,
  SimpleScopeTypeType,
  TextEditor,
} from "@cursorless/common";
import { LanguageDefinition } from "../../../languages/LanguageDefinition";
import { LanguageDefinitions } from "../../../languages/LanguageDefinitions";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { Target } from "../../../typings/target.types";
import { getInsertionDelimiter } from "../../../util/nodeSelectors";
import { getRangeLength } from "../../../util/rangeUtils";
import { ModifierStage } from "../../PipelineStages.types";
import { ScopeTypeTarget } from "../../targets";
import ContainingSyntaxScopeStage, {
  SimpleContainingScopeModifier,
} from "../scopeTypeStages/ContainingSyntaxScopeStage";
import { getIterationScope } from "./getIterationScope";
import { tokenizeRange } from "./tokenizeRange";

export default class ItemStage implements ModifierStage {
  constructor(
    private languageDefinitions: LanguageDefinitions,
    private modifier: ContainingScopeModifier | EveryScopeModifier,
  ) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    // First try the language specific implementation of item
    try {
      return new ContainingSyntaxScopeStage(
        this.modifier as SimpleContainingScopeModifier,
      ).run(context, target);
    } catch (_error) {
      // do nothing
    }

    const languageDefinition = this.languageDefinitions.get(
      target.editor.document.languageId,
    );

    // Then try the textual implementation
    if (this.modifier.type === "everyScope") {
      return this.getEveryTarget(languageDefinition, context, target);
    }
    return [this.getSingleTarget(languageDefinition, context, target)];
  }

  private getEveryTarget(
    languageDefinition: LanguageDefinition | undefined,
    context: ProcessedTargetsContext,
    target: Target,
  ) {
    const itemInfos = getItemInfosForIterationScope(
      languageDefinition,
      context,
      target,
    );

    // If target has explicit range filter to items in that range. Otherwise expand to all items in iteration scope.
    const filteredItemInfos = target.hasExplicitRange
      ? filterItemInfos(target, itemInfos)
      : itemInfos;

    if (filteredItemInfos.length === 0) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    return filteredItemInfos.map((itemInfo) =>
      this.itemInfoToTarget(target, itemInfo),
    );
  }

  private getSingleTarget(
    languageDefinition: LanguageDefinition | undefined,
    context: ProcessedTargetsContext,
    target: Target,
  ) {
    const itemInfos = getItemInfosForIterationScope(
      languageDefinition,
      context,
      target,
    );

    const filteredItemInfos = filterItemInfos(target, itemInfos);

    if (filteredItemInfos.length === 0) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    const first = filteredItemInfos[0];
    const last = filteredItemInfos[filteredItemInfos.length - 1];

    const itemInfo: ItemInfo = {
      contentRange: first.contentRange.union(last.contentRange),
      domain: first.domain.union(last.domain),
      leadingDelimiterRange: first.leadingDelimiterRange,
      trailingDelimiterRange: last.trailingDelimiterRange,
    };

    // We have both leading and trailing delimiter ranges
    // The leading one is longer/more specific so prefer to use that for removal.
    const removalRange =
      itemInfo.leadingDelimiterRange != null &&
      itemInfo.trailingDelimiterRange != null &&
      getRangeLength(target.editor, itemInfo.leadingDelimiterRange) >
        getRangeLength(target.editor, itemInfo.trailingDelimiterRange)
        ? itemInfo.contentRange.union(itemInfo.leadingDelimiterRange)
        : undefined;

    return this.itemInfoToTarget(target, itemInfo, removalRange);
  }

  private itemInfoToTarget(
    target: Target,
    itemInfo: ItemInfo,
    removalRange?: Range,
  ) {
    const delimiter = getInsertionDelimiter(
      target.editor,
      itemInfo.leadingDelimiterRange,
      itemInfo.trailingDelimiterRange,
      ", ",
    );
    return new ScopeTypeTarget({
      scopeTypeType: this.modifier.scopeType.type as SimpleScopeTypeType,
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange: itemInfo.contentRange,
      delimiter,
      leadingDelimiterRange: itemInfo.leadingDelimiterRange,
      trailingDelimiterRange: itemInfo.trailingDelimiterRange,
      removalRange,
    });
  }
}

/** Filter item infos by content range and domain intersection */
function filterItemInfos(target: Target, itemInfos: ItemInfo[]): ItemInfo[] {
  return itemInfos.filter(
    (itemInfo) => itemInfo.domain.intersection(target.contentRange) != null,
  );
}

function getItemInfosForIterationScope(
  languageDefinition: LanguageDefinition | undefined,
  context: ProcessedTargetsContext,
  target: Target,
) {
  const { range, boundary } = getIterationScope(
    languageDefinition,
    context,
    target,
  );
  return getItemsInRange(target.editor, range, boundary);
}

function getItemsInRange(
  editor: TextEditor,
  interior: Range,
  boundary?: [Range, Range],
): ItemInfo[] {
  const tokens = tokenizeRange(editor, interior, boundary);
  const itemInfos: ItemInfo[] = [];

  tokens.forEach((token, i) => {
    if (token.type === "separator" || token.type === "boundary") {
      return;
    }

    const leadingDelimiterRange = (() => {
      if (tokens[i - 2]?.type === "item") {
        return new Range(tokens[i - 2].range.end, token.range.start);
      }
      if (tokens[i - 1]?.type === "separator") {
        return new Range(tokens[i - 1].range.start, token.range.start);
      }
      return undefined;
    })();

    const trailingDelimiterRange = (() => {
      if (tokens[i + 2]?.type === "item") {
        return new Range(token.range.end, tokens[i + 2].range.start);
      }
      if (tokens[i + 1]?.type === "separator") {
        return new Range(token.range.end, tokens[i + 1].range.end);
      }
      return undefined;
    })();

    // Leading boundary and separator are excluded
    const domainStart =
      tokens[i - 1]?.type === "boundary" || tokens[i - 1]?.type === "separator"
        ? tokens[i - 1].range.end
        : token.range.start;

    // Trailing boundary and separator are excluded
    const domainEnd =
      tokens[i + 1]?.type === "boundary" || tokens[i + 1]?.type === "separator"
        ? tokens[i + 1].range.start
        : token.range.end;

    itemInfos.push({
      contentRange: token.range,
      leadingDelimiterRange,
      trailingDelimiterRange,
      domain: new Range(domainStart, domainEnd),
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
