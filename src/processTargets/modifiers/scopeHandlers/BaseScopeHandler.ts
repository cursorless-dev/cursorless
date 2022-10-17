import { Position, Range, TextEditor } from "vscode";
import { NoContainingScopeError } from "../../../errors";
import { Target } from "../../../typings/target.types";
import { Direction, ScopeType } from "../../../typings/targetDescriptor.types";
import { CommonTargetParameters } from "../../targets";
import { IterationScope, Scope, ScopeHandler } from "./scopeHandler.types";

export abstract class BaseScopeHandler implements ScopeHandler {
  constructor(private scopeType: ScopeType) {}

  protected abstract iterateIterationRanges(
    editor: TextEditor,
    position: Position,
    direction: Direction
  ): IterableIterator<Range>;

  protected abstract getScopesInIterationRange(
    editor: TextEditor,
    range: Range
  ): ExtendedScope[];

  protected abstract getContainingIterationRange(
    editor: TextEditor,
    position: Position
  ): Range;

  getScopeContainingPosition(editor: TextEditor, position: Position): Scope {
    const iterationRange = this.getContainingIterationRange(editor, position);

    const scopes = this.getScopesInIterationRange(editor, iterationRange);

    const intersectingTargets = scopes.filter(({ domain }) =>
      domain.contains(position)
    );

    if (intersectingTargets.length === 0) {
      throw new NoContainingScopeError(this.scopeType.type);
    }

    if (intersectingTargets.length === 1) {
      return intersectingTargets[0];
    }

    return intersectingTargets
      .sort(
        (a, b) => a.compareTo?.(b) ?? a.domain.start.compareTo(b.domain.start)
      )
      .at(-1)!;
  }

  getScopesIntersectingRange(editor: TextEditor, range: Range): Scope[] {
    const startIterationRange = this.getContainingIterationRange(
      editor,
      range.start
    );
    const iterationRange = startIterationRange.contains(range.end)
      ? startIterationRange
      : startIterationRange.union(
          this.getContainingIterationRange(editor, range.end)
        );

    const scopes = this.getScopesInIterationRange(editor, iterationRange);

    return scopes.filter((scope) => {
      const intersection = scope.domain.intersection(range);
      return intersection != null && !intersection.isEmpty;
    });
  }

  getIterationScopeContainingPosition(
    editor: TextEditor,
    position: Position
  ): IterationScope {
    const iterationRange = this.getContainingIterationRange(editor, position);

    const scopes = this.getScopesInIterationRange(editor, iterationRange);

    return { domain: iterationRange, scopes };
  }

  getScopeRelativeToPosition(
    editor: TextEditor,
    position: Position,
    offset: number,
    direction: Direction
  ): Scope {
    const containingiterationRange = this.getContainingIterationRange(
      editor,
      position
    );
    const scopes = this.getScopesInIterationRange(
      editor,
      containingiterationRange
    );
    const iterator = this.iterateIterationRanges(editor, position);
    for (const iterationRange of iterator) {
      console.log(itItem);
    }
  }

  run(
    editor: TextEditor,
    contentRange: Range,
    isReversed: boolean,
    hasExplicitRange: boolean
  ): IterationScope {
    const targets = this.getEveryTarget(
      editor,
      contentRange,
      isReversed,
      hasExplicitRange
    );

    const containingIndices = contentRange.isEmpty
      ? this.getContainingIndicesForPosition(contentRange.start, targets)
      : this.getContainingIndicesForRange(contentRange, targets);

    return {
      targets,
      containingIndices,
    };
  }

  private getEveryTarget(
    editor: TextEditor,
    contentRange: Range,
    isReversed: boolean,
    hasExplicitRange: boolean
  ): Target[] {
    const scopes = this.getEveryScope(editor, contentRange);

    const filteredScopes = hasExplicitRange
      ? this.filterScopesByIterationScope(contentRange, scopes)
      : scopes;

    return filteredScopes.map((scope) =>
      this.createTarget({ ...scope.targetParameters, editor, isReversed })
    );
  }

  private filterScopesByIterationScope(
    iterationScope: Range,
    scopes: Scope[]
  ): Scope[] {
    return scopes.filter((scope) => {
      const intersection = scope.domain.intersection(iterationScope);
      return intersection != null && !intersection.isEmpty;
    });
  }

  private getContainingIndicesForRange(
    range: Range,
    targets: Target[]
  ): ContainingIndices | undefined {
    const mappings = targets
      .map((target, index) => ({ range: target.contentRange, index }))
      .filter((mapping) => {
        const intersection = mapping.range.intersection(range);
        return intersection != null && !intersection.isEmpty;
      });

    if (mappings.length === 0) {
      return undefined;
    }

    return { start: mappings[0].index, end: mappings.at(-1)!.index };
  }

  private getContainingIndicesForPosition(
    position: Position,
    targets: Target[]
  ): ContainingIndices | undefined {
    const mappings = targets
      .map((target, index) => ({ range: target.contentRange, index }))
      .filter((mapping) => mapping.range.contains(position));

    if (mappings.length === 0) {
      return undefined;
    }

    const index = mappings.at(-1)!.index;

    return { start: index, end: index };
  }

  protected abstract getEveryScope(
    editor: TextEditor,
    contentRange: Range
  ): Scope[];

  protected abstract createTarget(parameters: CommonTargetParameters): Target;
}

export interface ExtendedScope extends Scope {
  editor: TextEditor;
  compareTo?(other: ExtendedScope): number;
}

interface ContainingIndices {
  start: number;
  end: number;
}

interface InternalIterationScope {
  targets: Target[];
  containingIndices: ContainingIndices | undefined;
}

interface TargetParameters {
  contentRange: Range;
}

interface InternalScope {
  domain: Range;
  targetParameters: TargetParameters;
}
