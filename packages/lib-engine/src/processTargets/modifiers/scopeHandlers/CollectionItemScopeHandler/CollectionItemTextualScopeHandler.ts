import type {
  Direction,
  Position,
  ScopeType,
  TextEditor,
} from "@cursorless/lib-common";
import { Range } from "@cursorless/lib-common";
import { shrinkRangeToFitContent } from "../../../../util/selectionUtils";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { compareTargetScopes } from "../compareTargetScopes";
import type { TargetScope } from "../scope.types";
import type {
  ComplexScopeType,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";
import { scopeHandlerCache } from "../ScopeHandlerCache";
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
    const cacheKey = `CollectionItemTextualScopeHandler_${isEveryScope}`;

    if (!scopeHandlerCache.isValid(cacheKey, editor.document)) {
      const scopes = this.getScopes(editor, isEveryScope);
      scopeHandlerCache.update(cacheKey, editor.document, scopes);
    }

    const scopes = scopeHandlerCache.get<TargetScope>();

    scopes.sort((a, b) => compareTargetScopes(direction, position, a, b));

    yield* scopes;
  }

  private getScopes(editor: TextEditor, isEveryScope: boolean) {
    const interiorRanges = getInteriorRanges(
      this.scopeHandlerFactory,
      this.languageId,
      editor,
      "collectionBoundary",
    );
    const scopes: TargetScope[] = [];

    const usedInteriors = this.addSeparatorRanges(
      editor,
      isEveryScope,
      interiorRanges,
      scopes,
    );

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

    return scopes;
  }

  private addSeparatorRanges(
    editor: TextEditor,
    isEveryScope: boolean,
    interiorRanges: { range: Range }[],
    scopes: TargetScope[],
  ): Set<Range> {
    const separatorRanges = getSeparatorOccurrences(editor.document);
    const usedInteriors = new Set<Range>();

    if (separatorRanges.length === 0) {
      return usedInteriors;
    }

    const iterationStatesStack: IterationState[] = [];
    const interiorRangeFinder = new OneWayNestedRangeFinder(interiorRanges);
    const stringRangeFinder = new OneWayRangeFinder(
      getInteriorRanges(
        this.scopeHandlerFactory,
        this.languageId,
        editor,
        "string",
      ),
    );
    let previousLine = -1;
    let previousLineRange: Range | undefined;

    const getLineRange = (line: number) => {
      // Separators are processed in document order, so line numbers are
      // monotonically increasing.
      if (line !== previousLine || previousLineRange == null) {
        previousLine = line;
        previousLineRange = editor.document.lineAt(line).range;
      }
      return previousLineRange;
    };

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
        containingInteriorRange ?? getLineRange(separator.start.line);

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

    return usedInteriors;
  }

  private addScopes(scopes: TargetScope[], state: IterationState) {
    const { editor, iterationRange, isEveryScope, delimiters } = state;

    if (delimiters.length === 0) {
      return;
    }

    const firstDelimiter = delimiters[0];
    let previousRange: Range | undefined;
    let currentRange = shrinkRangeToFitContent(
      editor,
      new Range(iterationRange.start, firstDelimiter.start),
    );
    let previousDelimiterEnd = firstDelimiter.end;

    for (let i = 1; i < delimiters.length; ++i) {
      const nextRange = shrinkRangeToFitContent(
        editor,
        new Range(previousDelimiterEnd, delimiters[i].start),
      );

      scopes.push(
        createTargetScope(
          isEveryScope,
          editor,
          iterationRange,
          currentRange,
          previousRange,
          nextRange,
        ),
      );

      previousRange = currentRange;
      currentRange = nextRange;
      previousDelimiterEnd = delimiters[i].end;
    }

    const trailingRange = shrinkRangeToFitContent(
      editor,
      new Range(previousDelimiterEnd, iterationRange.end),
    );

    // Emit the item before the final delimiter, using the trailing range as
    // nextRange so delimiter metadata remains correct.
    scopes.push(
      createTargetScope(
        isEveryScope,
        editor,
        iterationRange,
        currentRange,
        previousRange,
        trailingRange,
      ),
    );

    // Handle trailing delimiter.
    if (editor.document.getText(trailingRange).trim() === "") {
      return;
    }

    scopes.push(
      createTargetScope(
        isEveryScope,
        editor,
        iterationRange,
        trailingRange,
        currentRange,
      ),
    );
  }
}

interface IterationState {
  editor: TextEditor;
  iterationRange: Range;
  isEveryScope: boolean;
  delimiters: Range[];
}
