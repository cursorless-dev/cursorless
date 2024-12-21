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
import { collectionItemIterationScopeHandler } from "./collectionItemIterationScopeHandler";
import { createTargetScope } from "./createTargetScope";
import { getInteriorRanges } from "./getInteriorRanges";
import { getSeparatorOccurrences } from "./getSeparatorOccurrences";

export class CollectionItemTextualScopeHandler extends BaseScopeHandler {
  public scopeType: ScopeType = { type: "collectionItem" };
  protected isHierarchical = true;

  get iterationScopeType(): ComplexScopeType {
    return collectionItemIterationScopeHandler;
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
    const isEveryScope = hints.containment == null && hints.skipAncestorScopes;
    const separatorRanges = getSeparatorOccurrences(editor.document);
    const interiorRanges = getInteriorRanges(
      this.scopeHandlerFactory,
      this.languageId,
      editor,
      "collectionBoundary",
    );
    const stringRanges = getInteriorRanges(
      this.scopeHandlerFactory,
      this.languageId,
      editor,
      "string",
    );
    const scopes: TargetScope[] = [];
    const usedInteriors = new Set<Range>();
    const iterationStatesStack: IterationState[] = [];

    for (const separator of separatorRanges) {
      // Separators in a string are not considered
      if (stringRanges.contains(separator)) {
        continue;
      }

      const currentIterationState =
        iterationStatesStack[iterationStatesStack.length - 1];

      // Get range for smallest containing interior
      const containingInteriorRange =
        interiorRanges.getsSmallestContaining(separator);

      // The contain range is either the interior or the line containing the separator
      const containingIterationRange =
        containingInteriorRange ??
        editor.document.lineAt(separator.start.line).range;

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
          this.addScopes(scopes, currentIterationState);
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
      if (containingInteriorRange != null) {
        usedInteriors.add(containingInteriorRange);
      }

      iterationStatesStack.push({
        editor,
        isEveryScope,
        iterationRange: containingIterationRange,
        delimiters: [separator],
      });
    }

    for (const state of iterationStatesStack) {
      this.addScopes(scopes, state);
    }

    // Add interior ranges without a delimiter in them. eg: `[foo]`
    for (const interior of interiorRanges.ranges) {
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
