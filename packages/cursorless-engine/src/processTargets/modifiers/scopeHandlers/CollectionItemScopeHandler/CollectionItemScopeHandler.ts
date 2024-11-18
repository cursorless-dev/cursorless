import {
  type Direction,
  type Position,
  Range,
  type ScopeType,
  type TextEditor,
} from "@cursorless/common";
import { shrinkRangeToFitContent } from "../../../../util/selectionUtils";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { compareTargetScopes } from "../compareTargetScopes";
import type { TargetScope } from "../scope.types";
import type {
  CustomScopeType,
  ScopeHandler,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";
import { CollectionItemIterationScopeHandler } from "./CollectionItemIterationScopeHandler";
import { createTargetScope } from "./createTargetScope";
import { getDelimiterOccurrences } from "./getDelimiterOccurrences";

export class CollectionItemScopeHandler extends BaseScopeHandler {
  public scopeType: ScopeType = { type: "collectionItem" };
  protected isHierarchical = true;

  private readonly surroundingPairInteriorScopeHandler: ScopeHandler;

  get iterationScopeType(): CustomScopeType {
    return {
      type: "custom",
      scopeHandler: new CollectionItemIterationScopeHandler(
        this.scopeHandlerFactory,
        this.languageId,
      ),
    };
  }

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
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
          containment: undefined,
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

    const scopes: TargetScope[] = [];
    const usedInteriors = new Set<Range>();
    let delimitersInIteration: Range[] = [];
    let previousInteriorRange: Range | undefined;
    let previousLineRange: Range | undefined;

    function addScopes() {
      if (delimitersInIteration.length === 0) {
        return;
      }

      const previousIterationRange = (previousInteriorRange ??
        previousLineRange)!;
      const itemRanges: Range[] = [];

      for (let i = 0; i < delimitersInIteration.length; ++i) {
        const current = delimitersInIteration[i];

        const previous =
          delimitersInIteration[i - 1]?.end ?? previousIterationRange.start;
        itemRanges.push(new Range(previous, current.start));
      }

      const lastDelimiter =
        delimitersInIteration[delimitersInIteration.length - 1];
      itemRanges.push(new Range(lastDelimiter.end, previousIterationRange.end));

      const trimmedRanges = itemRanges.map((range) =>
        shrinkRangeToFitContent(editor, range),
      );

      for (let i = 0; i < trimmedRanges.length; ++i) {
        // Handle trailing delimiter
        if (
          i === trimmedRanges.length - 1 &&
          document.getText(trimmedRanges[i]).trim() === ""
        ) {
          continue;
        }
        scopes.push(
          createTargetScope(
            editor,
            previousIterationRange,
            trimmedRanges[i],
            trimmedRanges[i - 1],
            trimmedRanges[i + 1],
          ),
        );
      }
    }

    for (const delimiter of delimiterRanges) {
      if (previousInteriorRange != null) {
        if (previousInteriorRange.contains(delimiter)) {
          delimitersInIteration.push(delimiter);
          continue;
        }
      } else {
        const interiorRange = interiorRanges.find((range) =>
          range.contains(delimiter),
        );

        if (interiorRange == null) {
          if (
            previousLineRange != null &&
            previousLineRange.contains(delimiter)
          ) {
            delimitersInIteration.push(delimiter);
            continue;
          }
        }
      }

      addScopes();

      previousInteriorRange = interiorRanges.find((range) =>
        range.contains(delimiter),
      );

      if (previousInteriorRange != null) {
        usedInteriors.add(previousInteriorRange);
        previousLineRange = undefined;
      } else {
        previousLineRange = document.lineAt(delimiter.start.line).range;
      }

      delimitersInIteration = [delimiter];
    }

    addScopes();

    // Add interior ranges without a delimiter in them. eg: `[foo]`
    for (const interior of interiorRanges) {
      if (!usedInteriors.has(interior)) {
        const range = shrinkRangeToFitContent(editor, interior);
        if (!range.isEmpty) {
          scopes.push(createTargetScope(editor, interior, range));
        }
      }
    }

    yield* scopes.sort((a, b) =>
      compareTargetScopes(direction, position, a, b),
    );
  }
}
