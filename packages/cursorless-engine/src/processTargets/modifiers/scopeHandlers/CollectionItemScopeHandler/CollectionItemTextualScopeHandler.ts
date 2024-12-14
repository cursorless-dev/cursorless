import {
  type Direction,
  Position,
  Range,
  type ScopeType,
  type SurroundingPairName,
  testRegex,
  type TextEditor,
} from "@cursorless/common";
import { shrinkRangeToFitContent } from "../../../../util/selectionUtils";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { compareTargetScopes } from "../compareTargetScopes";
import type { TargetScope } from "../scope.types";
import type {
  ComplexScopeType,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";
import { createTargetScope } from "./createTargetScope";
import {
  getSeparatorOccurrences,
  separatorRegex,
} from "./getSeparatorOccurrences";

export class CollectionItemTextualScopeHandler extends BaseScopeHandler {
  public scopeType: ScopeType = { type: "collectionItem" };
  protected isHierarchical = true;

  get iterationScopeType(): ScopeType | ComplexScopeType {
    return {
      type: "fallback",
      scopeTypes: [
        {
          type: "surroundingPairInterior",
          delimiter: "collectionBoundary",
        },
        {
          type: "conditional",
          scopeType: {
            type: "line",
          },
          predicate: (scope: TargetScope) => {
            const text = scope.editor.document.getText(scope.domain);
            return testRegex(separatorRegex, text);
          },
        },
      ],
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
    );
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
    const separatorRanges = getSeparatorOccurrences(document);

    const interiorRanges = this.getInteriorRanges(editor, "collectionBoundary");
    const stringRanges = this.getInteriorRanges(editor, "string");

    const scopes: TargetScope[] = [];
    const usedInteriors = new Set<Range>();
    const iterationStatesStack: IterationState[] = [];

    function addScopes(state: IterationState) {
      const { delimiters, iterationRange: iterationRange } = state;

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

    //   TODO: fixed performance on large files
    for (const separator of separatorRanges) {
      // Separators in a string are not considered
      if (stringRanges.some((range) => range.contains(separator))) {
        continue;
      }

      const currentIterationState =
        iterationStatesStack[iterationStatesStack.length - 1];

      // Get range for smallest containing interior
      const containingInteriorRange: Range | undefined = interiorRanges
        .filter((range) => range.contains(separator))
        .sort((a, b) => (a.contains(b) ? 1 : b.contains(a) ? -1 : 0))[0];

      // The contain range is either the interior or the line containing the separator
      const containingIterationRange =
        containingInteriorRange ?? document.lineAt(separator.start.line).range;

      if (currentIterationState != null) {
        // The current containing iteration range is the same as the previous one. Just append delimiter.
        if (
          currentIterationState.iterationRange.isRangeEqual(
            containingIterationRange,
          )
        ) {
          currentIterationState.delimiters.push(separator);
          continue;
        }

        // The current containing range does not intersect previous one. Add scopes and remove state.
        if (!currentIterationState.iterationRange.contains(separator)) {
          addScopes(currentIterationState);
          // Remove already added state
          iterationStatesStack.pop();
        }
      }

      // The current containing range is the same as the previous one. Just append delimiter.
      if (iterationStatesStack.length > 0) {
        const lastState = iterationStatesStack[iterationStatesStack.length - 1];
        if (lastState.iterationRange.isRangeEqual(containingIterationRange)) {
          lastState.delimiters.push(separator);
          continue;
        }
      }

      // New containing range. Add it to the list.
      usedInteriors.add(containingInteriorRange);

      iterationStatesStack.push({
        iterationRange: containingIterationRange,
        delimiters: [separator],
      });
    }

    for (const state of iterationStatesStack) {
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
  iterationRange: Range;
  delimiters: Range[];
}
