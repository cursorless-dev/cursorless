import { Range, TextEditor } from "vscode";
import { NoContainingScopeError } from "../../../errors";
import { Target } from "../../../typings/target.types";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
  SimpleScopeTypeType,
} from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { rangeLength } from "../../../util/rangeUtils";
import { ModifierStage } from "../../PipelineStages.types";
import ScopeTypeTarget from "../../targets/ScopeTypeTarget";
import { processSurroundingPair } from "../surroundingPair";
import { SurroundingPairInfo } from "../surroundingPair/extractSelectionFromSurroundingPairOffsets";
import ContainingSyntaxScopeStage, {
  SimpleContainingScopeModifier,
} from "./ContainingSyntaxScopeStage";
import { fitRangeToLineContent } from "./LineStage";

export default class ItemStage implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    try {
      return new ContainingSyntaxScopeStage(
        <SimpleContainingScopeModifier>this.modifier
      ).run(context, target);
    } catch (_error) {}

    if (this.modifier.type === "everyScope") {
      return this.getEveryTarget(context, target);
    }
    return [this.getSingleTarget(context, target)];
  }

  private getEveryTarget(context: ProcessedTargetsContext, target: Target) {
    const itemInfos = getItemInfos(context, target);

    if (itemInfos.length < 1) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    return itemInfos.map((itemInfo) => this.itemInfoToTarget(target, itemInfo));
  }

  private getSingleTarget(context: ProcessedTargetsContext, target: Target) {
    const itemInfos = getItemInfos(context, target);

    const itemInfoWithIntersections = itemInfos
      .map((itemInfo) => ({
        itemInfo,
        intersection: itemInfo.matchRange.intersection(target.contentRange),
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
    return new ScopeTypeTarget({
      scopeTypeType: <SimpleScopeTypeType>this.modifier.scopeType.type,
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange: itemInfo.range,
      delimiter: delimiterInsertion,
      leadingDelimiterRange: itemInfo.leadingDelimiterRange,
      trailingDelimiterRange: itemInfo.trailingDelimiterRange,
    });
  }
}

function getItemInfos(context: ProcessedTargetsContext, target: Target) {
  const { range, boundary } = getCollectionRange(context, target);
  return tokensToItemInfos(target.editor, range, boundary);
}

function getCollectionRange(context: ProcessedTargetsContext, target: Target) {
  // First check if we are in a string
  let pairInfo = getStringSurroundingPair(
    context,
    target.editor,
    target.contentRange
  );

  // We don't look for items inside strings. If we are in a string go to parent
  pairInfo =
    pairInfo != null
      ? getParentSurroundingPair(context, target.editor, pairInfo)
      : getSurroundingPair(context, target.editor, target.contentRange);

  while (pairInfo != null) {
    // The selection from the beginning was this pair and we should not go into the interior but instead look in the parent.
    const isNotInterior =
      target.contentRange.isEqual(pairInfo.contentRange) ||
      target.contentRange.start.isBeforeOrEqual(pairInfo.boundary[0].start) ||
      target.contentRange.end.isAfterOrEqual(pairInfo.boundary[1].end);
    if (!isNotInterior) {
      return {
        range: pairInfo.interiorRange,
        boundary: pairInfo.boundary,
      };
    }
    pairInfo = getParentSurroundingPair(context, target.editor, pairInfo);
  }

  // We have not found a pair containing the delimiter. Look at the full line.
  return {
    range: fitRangeToLineContent(target.editor, target.contentRange),
  };
}

function tokensToItemInfos(
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
    const leadingMatchStart =
      tokens[i - 1]?.type === "delimiter" || tokens[i - 1]?.type === "boundary"
        ? tokens[i - 1].range.start
        : token.range.start;
    const trailingMatchEnd =
      tokens[i + 1]?.type === "boundary"
        ? tokens[i + 1].range.end
        : tokens[i + 1]?.type === "delimiter"
        ? tokens[i + 1].range.start
        : token.range.start;
    const matchRange = new Range(leadingMatchStart, trailingMatchEnd);
    itemInfos.push({
      range: token.range,
      leadingDelimiterRange,
      trailingDelimiterRange,
      matchRange,
    });
  });

  return itemInfos;
}

function tokenizeRange(
  editor: TextEditor,
  collectionRange: Range,
  collectionBoundary?: [Range, Range]
) {
  const { document } = editor;
  const text = document.getText(collectionRange);
  const parts = text.split(/([,(){}<>[\]"'])/g).filter(Boolean);
  const tokens: Token[] = [];
  let offset = document.offsetAt(collectionRange.start);
  let waitingForDelimiter: string | null = null;
  let offsetStart = 0;

  parts.forEach((text) => {
    // Whitespace found. Just skip
    if (text.trim().length === 0) {
      offset += text.length;
      return;
    }

    // We are waiting for a closing delimiter
    if (waitingForDelimiter != null) {
      // Closing delimiter found
      if (waitingForDelimiter === text) {
        waitingForDelimiter = null;
        tokens.push({
          type: "item",
          range: new Range(
            document.positionAt(offsetStart),
            document.positionAt(offset + text.length)
          ),
        });
      }
    }
    // Separator delimiter found.
    else if (text === delimiter) {
      tokens.push({
        type: "delimiter",
        range: new Range(
          document.positionAt(offset),
          document.positionAt(offset + text.length)
        ),
      });
    }
    // Starting delimiter found
    else if (delimiters[text] != null) {
      waitingForDelimiter = delimiters[text];
      offsetStart = offset;
    }
    // Text/item content found
    else {
      const offsetStart = offset + (text.length - text.trimStart().length);
      tokens.push({
        type: "item",
        range: new Range(
          document.positionAt(offsetStart),
          document.positionAt(offsetStart + text.trim().length)
        ),
      });
    }

    offset += text.length;
  });

  if (tokens.length > 1 && !tokens.find((t) => t.type === "delimiter")) {
    return [];
  }

  if (collectionBoundary != null) {
    return [
      { type: "boundary", range: collectionBoundary[0] },
      ...tokens,
      { type: "boundary", range: collectionBoundary[1] },
    ];
  }

  return tokens;
}

function getSurroundingPair(
  context: ProcessedTargetsContext,
  editor: TextEditor,
  contentRange: Range
) {
  return processSurroundingPair(context, editor, contentRange, {
    type: "surroundingPair",
    delimiter: "any",
  });
}

function getParentSurroundingPair(
  context: ProcessedTargetsContext,
  editor: TextEditor,
  pairInfo: SurroundingPairInfo
) {
  // Step out of this pair and see if we have a parent
  const position = editor.document.positionAt(
    editor.document.offsetAt(pairInfo.contentRange.start) - 1
  );
  return getSurroundingPair(context, editor, new Range(position, position));
}

function getStringSurroundingPair(
  context: ProcessedTargetsContext,
  editor: TextEditor,
  contentRange: Range
) {
  return processSurroundingPair(context, editor, contentRange, {
    type: "surroundingPair",
    delimiter: "string",
  });
}

interface ItemInfo {
  range: Range;
  leadingDelimiterRange?: Range;
  trailingDelimiterRange?: Range;
  matchRange: Range;
}

interface Token {
  range: Range;
  type: string;
}

const delimiter = ",";
const delimiterInsertion = ", ";

// Mapping between opening and closing delimiters
/* eslint-disable @typescript-eslint/naming-convention */
const delimiters: { [key: string]: string } = {
  "(": ")",
  "{": "}",
  "<": ">",
  "[": "]",
  '"': '"',
  "'": "'",
};
/* eslint-enable @typescript-eslint/naming-convention */
