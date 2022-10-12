// import { Position, Range, TextEditor } from "vscode";
// import { Target } from "../../../typings/target.types";

import { Position, Range, TextEditor } from "vscode";
import { Target } from "../../../typings/target.types";
import { ScopeType } from "../../../typings/targetDescriptor.types";

// /**
//  * Represents a scope, which is a specific instantiation of a scope type,
//  * eg a specific function, or a specific line or range of lines.  Contains
//  * {@link target}, which represents the actual scope, as well as {@link domain},
//  * which represents the range within which the given scope is canonical.  For
//  * example, a scope representing the type of a parameter will have the entire
//  * parameter as its domain, so that one can say "take type" from anywhere
//  * within the parameter.
//  */
// export interface Scope {
//   /**
//    * The domain within which this scope is considered the canonical instance of
//    * this scope type.  For example, if the scope type represents a `key` in a
//    * key-value pair, then the pair would be the `domain`, so that "take key"
//    * works from anywhere within the given pair.
//    *
//    * Most scopes will have a domain that is just the content range or removal
//    * range of the scope.
//    */
//   domain: Range;

//   /**
//    * The target that represents this scope.  Note that the target can represent
//    * a contiguous range of instances of the given scope type, eg a range from
//    * one function to another or a line range.
//    */
//   target: Target;
// }

// /**
//  * Represents an iteration scope, which is a domain containing one or more
//  * scopes that are considered siblings for use with `"every"`. This type
//  * contains {@link getScopes}, which is a list of the actual scopes, as well as
//  * {@link domain}, which represents the range within which the given iteration
//  * scope is canonical.  For example, an iteration scope for the scope type
//  * `functionOrParameter` might have a class as its domain and its targets would
//  * be the functions in the class. This way one can say "take every funk" from
//  * anywhere within the class.
//  */
// export interface IterationScope {
//   /**
//    * The domain within which this iteration scope is considered the canonical
//    * iteration scope for the given scope type.  For example, if the scope type
//    * is function, then the domain might be a class, so that "take every funk"
//    * works from anywhere within the given class.
//    */
//   domain: Range;

//   /**
//    * The scopes in the given iteration scope.  Note that each scope has its own
//    * domain.  We make this a function so that the scopes can be returned
//    * lazily.
//    */
//   getScopes(): Scope[];
// }

// /**
//  * Represents a scope type, containing functions that can be used to find
//  * specific instances of the given scope type in a document.  For example, it
//  * has  a function to find the scope containing a given position, a function to
//  * find every instance of the scope in a range, etc.
//  */
// export interface ScopeHandler {
//   /**
//    * Given a position in a document find the smallest can scope containing the
//    * given position. A scope is considered to contain the position even if it is
//    * adjacent to the position and the position is empty. If the position is
//    * adjacent to two scopes prefer the one to the right.  If no scope contains
//    * the given position return null.
//    * @param position The position from which to expand
//    */

//   /**
//    * Returns the iteration scopes containing {@link position}, in order of
//    * preference. For example, if the position is inside a class, the iteration
//    * scope could contain a list of functions in the class.
//    *
//    * If the target has an explicit range which extends beyond the first
//    * iteration scope returned, then the caller will look at the next iteration
//    * scopes, which are expected to be increasingly large.
//    *
//    * For example, "token" prefers an iteration scope of "line", but in order to
//    * support things like "every token block", "token" will have a secondary
//    * iteration scope of the entire file.
//    *
//    * It is common to either return a single iteration scope, or to return a
//    * list of two iteration scopes: the preferred scope, followed by an
//    * iteration scope representing the entire file.  Returning more than these
//    * two is just an optimization.
//    * @param position The position from which to expand
//    */
//   getTargetsIntersectingRange(editor: TextEditor, range: Range): Target[];

//   getTargetsInIterationScopeContainingRange(
//     editor: TextEditor,
//     range: Range
//   ): Target[];
// },

export interface ContainingIndices {
  start: number;
  end: number;
}

export interface IterationScope {
  targets: Target[];
  containingIndices: ContainingIndices | undefined;
}

export interface Scope {
  domain: Range;
  targetParameters: object;
}

export abstract class ScopeHandler {
  constructor(protected scopeType: ScopeType) {}

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

  protected getContainingIndicesForPosition(
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

  protected abstract createTarget(parameters: object): Target;
}
