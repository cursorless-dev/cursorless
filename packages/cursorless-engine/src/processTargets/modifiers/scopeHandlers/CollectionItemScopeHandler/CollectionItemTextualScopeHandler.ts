import {
  type Direction,
  Position,
  Range,
  type ScopeType,
  type SurroundingPairName,
  type TextEditor,
} from "@cursorless/common";
import { shrinkRangeToFitContent } from "../../../../util/selectionUtils";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { compareTargetScopes } from "../compareTargetScopes";
import type { TargetScope } from "../scope.types";
import type {
  CustomScopeType,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";
import { CollectionItemIterationScopeHandler } from "./CollectionItemIterationScopeHandler";
import { createTargetScope } from "./createTargetScope";
import { getDelimiterOccurrences } from "./getDelimiterOccurrences";

export class CollectionItemTextualScopeHandler extends BaseScopeHandler {
  public scopeType: ScopeType = { type: "collectionItem" };
  protected isHierarchical = true;

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
  }

  private getInteriorRanges(
    editor: TextEditor,
    delimiter: SurroundingPairName,
  ): Range[] {
    const scopeHandler = this.scopeHandlerFactory.create(
      {
        type: "surroundingPairInterior",
        delimiter,
      },
      this.languageId,
    )!;
    return Array.from(
      scopeHandler.generateScopes(editor, new Position(0, 0), "forward", {
        containment: undefined,
        skipAncestorScopes: false,
        includeDescendantScopes: true,
      }),
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
    const isEveryScope = hints.containment == null && hints.skipAncestorScopes;
    const delimiterRanges = getDelimiterOccurrences(document);

    const interiorRanges = this.getInteriorRanges(editor, "collectionBoundary");
    const stringRanges = this.getInteriorRanges(editor, "string");

    const scopes: TargetScope[] = [];
    const usedInteriors = new Set<Range>();
    const previousIterationRanges: IterationState[] = [];

    function addScopes(state: IterationState) {
      const { delimiters, range: iterationRange } = state;

      if (delimiters.length === 0) {
        return;
      }

      const itemRanges: Range[] = [];

      for (let i = 0; i < delimiters.length; ++i) {
        const current = delimiters[i];

        const previous = delimiters[i - 1]?.end ?? iterationRange.start;
        itemRanges.push(new Range(previous, current.start));
      }

      const lastDelimiter = delimiters[delimiters.length - 1];
      itemRanges.push(new Range(lastDelimiter.end, iterationRange.end));

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
            isEveryScope,
            editor,
            iterationRange,
            trimmedRanges[i],
            trimmedRanges[i - 1],
            trimmedRanges[i + 1],
          ),
        );
      }
    }

    for (const delimiter of delimiterRanges) {
      // Delimiters in a string are not considered
      if (stringRanges.some((range) => range.contains(delimiter))) {
        continue;
      }

      const currentState =
        previousIterationRanges[previousIterationRanges.length - 1];

      // Get range for smallest containing interior
      const containingInteriorRange: Range | undefined = interiorRanges
        .filter((range) => range.contains(delimiter))
        .sort((a, b) => (a.contains(b) ? 1 : b.contains(a) ? -1 : 0))[0];

      // The contain range is either the interior or the line containing the delimiter
      const containingRange =
        containingInteriorRange ?? document.lineAt(delimiter.start.line).range;

      if (currentState != null) {
        // The current containing range is the same as the previous one. Just append delimiter.
        if (currentState.range.isRangeEqual(containingRange)) {
          currentState.delimiters.push(delimiter);
          continue;
        }

        // The current containing range does not intersect previous one. Add scopes and remove state.
        if (!currentState.range.contains(delimiter)) {
          addScopes(currentState);
          // Remove already added state
          previousIterationRanges.pop();
        }
      }

      // The current containing range is the same as the previous one. Just append delimiter.
      if (previousIterationRanges.length > 0) {
        const lastState =
          previousIterationRanges[previousIterationRanges.length - 1];
        if (lastState.range.isRangeEqual(containingRange)) {
          lastState.delimiters.push(delimiter);
          continue;
        }
      }

      // New containing range. Add it to the list.
      usedInteriors.add(containingInteriorRange);

      previousIterationRanges.push({
        range: containingRange,
        delimiters: [delimiter],
      });
    }

    for (const state of previousIterationRanges) {
      addScopes(state);
    }

    // Add interior ranges without a delimiter in them. eg: `[foo]`
    for (const interior of interiorRanges) {
      if (!usedInteriors.has(interior)) {
        const range = shrinkRangeToFitContent(editor, interior);
        if (!range.isEmpty) {
          scopes.push(createTargetScope(isEveryScope, editor, interior, range));
        }
      }
    }

    scopes.sort((a, b) => compareTargetScopes(direction, position, a, b));

    yield* scopes;
  }
}

interface IterationState {
  range: Range;
  delimiters: Range[];
}
