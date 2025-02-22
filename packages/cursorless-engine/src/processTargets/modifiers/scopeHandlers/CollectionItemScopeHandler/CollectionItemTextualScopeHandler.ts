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
  ComplexScopeType,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";
import { isEveryScopeModifier } from "../util/isHintsEveryScope";
import { OneWayNestedRangeFinder } from "../util/OneWayNestedRangeFinder";
import { OneWayRangeFinder } from "../util/OneWayRangeFinder";
import { collectionItemTextualIterationScopeHandler } from "./collectionItemTextualIterationScopeHandler";
import { createTargetScope } from "./createTargetScope";
import { getInteriorRanges } from "./getInteriorRanges";
import { getSeparatorOccurrences } from "./getSeparatorOccurrences";

export class CollectionItemTextualScopeHandler extends BaseScopeHandler {
  public scopeType: ScopeType = { type: "collectionItem" };
  protected isHierarchical = true;

  get iterationScopeType(): ComplexScopeType {
    return collectionItemTextualIterationScopeHandler;
  }

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private languageId: string,
  ) {
    super();
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const isEveryScope = isEveryScopeModifier(hints);
    const separatorRanges = getSeparatorOccurrences(editor.document);
    const interiorRanges = getInteriorRanges(
      this.scopeHandlerFactory,
      this.languageId,
      editor,
      "collectionBoundary",
    );
    const interiorRangeFinder = new OneWayNestedRangeFinder(interiorRanges);
    const stringRanges = getInteriorRanges(
      this.scopeHandlerFactory,
      this.languageId,
      editor,
      "string",
    );
    const stringRangeFinder = new OneWayRangeFinder(stringRanges);
    const scopes: TargetScope[] = [];
    const usedInteriors = new Set<Range>();
    const iterationStatesStack: IterationState[] = [];

    for (const separator of separatorRanges) {
      // Separators in a string are not considered
      if (stringRangeFinder.contains(separator)) {
        continue;
      }

      let currentIterationState: IterationState | undefined;

      // Find current iteration state and pop all states not containing the separator
      while (iterationStatesStack.length > 0) {
        const lastState = iterationStatesStack[iterationStatesStack.length - 1];
        if (lastState.iterationRange.contains(separator)) {
          currentIterationState = lastState;
          break;
        }
        // We are done with this iteration scope. Add all scopes from it and pop it from the stack.
        this.addScopes(scopes, lastState);
        iterationStatesStack.pop();
      }

      // Get range for smallest containing interior
      const containingInteriorRange =
        interiorRangeFinder.getSmallestContaining(separator)?.range;

      // The containing iteration range is either the interior or the line containing the separator
      const containingIterationRange =
        containingInteriorRange ??
        editor.document.lineAt(separator.start.line).range;

      // The current containing iteration range is the same as the previous one. Just append delimiter.
      if (
        currentIterationState != null &&
        currentIterationState.iterationRange.isRangeEqual(
          containingIterationRange,
        )
      ) {
        currentIterationState.delimiters.push(separator);
        continue;
      }

      // New containing range. Add it to the set.
      if (containingInteriorRange != null) {
        usedInteriors.add(containingInteriorRange);
      }

      // New containing iteration range. Push it to the stack.
      iterationStatesStack.push({
        editor,
        isEveryScope,
        iterationRange: containingIterationRange,
        delimiters: [separator],
      });
    }

    // Process any remaining states on the stack
    for (const state of iterationStatesStack) {
      this.addScopes(scopes, state);
    }

    // Add interior ranges without a delimiter in them. eg: `[foo]`
    for (const interior of interiorRanges) {
      if (!usedInteriors.has(interior.range) && !interior.range.isEmpty) {
        const range = shrinkRangeToFitContent(editor, interior.range);
        if (!range.isEmpty) {
          scopes.push(
            createTargetScope(isEveryScope, editor, interior.range, range),
          );
        }
      }
    }

    scopes.sort((a, b) => compareTargetScopes(direction, position, a, b));

    yield* scopes;
  }

  private addScopes(scopes: TargetScope[], state: IterationState) {
    const { editor, iterationRange, isEveryScope, delimiters } = state;

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
        editor.document.getText(trimmedRanges[i]).trim() === ""
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
}

interface IterationState {
  editor: TextEditor;
  iterationRange: Range;
  isEveryScope: boolean;
  delimiters: Range[];
}
