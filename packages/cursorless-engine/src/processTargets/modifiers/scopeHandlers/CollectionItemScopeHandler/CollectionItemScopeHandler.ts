import {
  type Direction,
  type Position,
  Range,
  type ScopeType,
  type TextEditor,
} from "@cursorless/common";
import type { LanguageDefinitions } from "../../../../languages/LanguageDefinitions";
import { shrinkRangeToFitContent } from "../../../../util/selectionUtils";
import { BaseScopeHandler } from "../BaseScopeHandler";
import type { TargetScope } from "../scope.types";
import type {
  ScopeHandler,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";
import { createTargetScope } from "./createTargetScope";
import { getDelimiterOccurrences } from "./getDelimiterOccurrences";

export class CollectionItemScopeHandler extends BaseScopeHandler {
  public scopeType: ScopeType = { type: "collectionItem" };
  protected isHierarchical = true;

  private readonly surroundingPairInteriorScopeHandler: ScopeHandler;

  public readonly iterationScopeType: ScopeType = {
    type: "oneOf",
    scopeTypes: [
      { type: "line" },
      {
        type: "surroundingPairInterior",
        delimiter: "collectionBoundary",
      },
    ],
  };

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private languageDefinitions: LanguageDefinitions,
    private languageId: string,
  ) {
    super();

    this.surroundingPairInteriorScopeHandler = this.scopeHandlerFactory.create(
      {
        type: "surroundingPairInterior",
        delimiter: "collectionBoundary",
      },
      this.languageId,
    )!;
  }

  private getInteriorRanges(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Range[] {
    return Array.from(
      this.surroundingPairInteriorScopeHandler.generateScopes(
        editor,
        position,
        direction,
        {
          ...hints,
          // For every (skipAncestorScopes=true) we don't want to go outside of the surrounding pair
          containment:
            hints.containment == null && hints.skipAncestorScopes
              ? "required"
              : hints.containment,
        },
      ),
      (scope) => scope.domain,
    );
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const { document } = editor;
    const delimiterRanges = getDelimiterOccurrences(document);

    const interiorRanges = this.getInteriorRanges(
      editor,
      position,
      direction,
      hints,
    );

    let delimitersInIteration: Range[] = [];
    let previousIterationRange: Range | undefined;

    function createItemRanges() {
      if (delimitersInIteration.length === 0) {
        return [];
      }
      const itemRanges: Range[] = [];
      for (let i = 0; i < delimitersInIteration.length; ++i) {
        const current = delimitersInIteration[i];
        const previous =
          delimitersInIteration[i - 1]?.end ?? previousIterationRange!.start;
        const itemRange = new Range(previous, current.start);
        itemRanges.push(itemRange);
      }
      const lastDelimiter =
        delimitersInIteration[delimitersInIteration.length - 1];
      const itemRange = new Range(
        lastDelimiter.end,
        previousIterationRange!.end,
      );
      itemRanges.push(itemRange);
      const trimmedRanges = itemRanges.map((range) =>
        shrinkRangeToFitContent(editor, range),
      );

      return trimmedRanges.map((range, i) =>
        createTargetScope(
          editor,
          range,
          trimmedRanges[i - 1],
          trimmedRanges[i + 1],
        ),
      );
    }

    for (const delimiter of delimiterRanges) {
      if (
        previousIterationRange != null &&
        previousIterationRange.contains(delimiter)
      ) {
        delimitersInIteration.push(delimiter);
        continue;
      }

      yield* createItemRanges();

      const interiorRange = interiorRanges.find((range) =>
        range.contains(delimiter),
      );
      previousIterationRange =
        interiorRange ?? document.lineAt(delimiter.start.line).range;
      delimitersInIteration = [delimiter];
    }

    yield* createItemRanges();
  }
}
