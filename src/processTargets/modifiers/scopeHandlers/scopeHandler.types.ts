import type { Position, Range, TextEditor } from "vscode";
import type {
  Direction,
  ScopeType,
} from "../../../typings/targetDescriptor.types";
import type { TargetScope, IterationScope } from "./scope.types";

/**
 * Represents a scope type.  The functions in this interface allow us to find
 * specific instances of the given scope type in a document.  For example, there
 * is a function to find the scopes touching a given position
 * ({@link getScopesTouchingPosition}), a function to find every instance of
 * the scope overlapping a range ({@link getScopesOverlappingRange}), etc.
 * These functions are used by the various modifier stages to implement
 * modifiers that involve the given scope type, such as containing, every,
 * next, etc.
 *
 * Note that some scope types are hierarchical, ie one scope of the given type
 * can contain another scope of the same type.  For example, a function can
 * contain other functions, so functions are hierarchical.  Surrounding pairs
 * are also hierarchical, as they can be nested.  Many scope types are not
 * hierarchical, though, eg line, token, word, etc.
 *
 * In the case of a hierarchical scope type, these functions should never
 * return two scopes that contain one another.  Ie if we return a surrounding
 * pair, we shouldn't also return any surrounding pairs contained within, or
 * if we return a function, we shouldn't also return a function nested within
 * that function.
 *
 * Note that there are helpers that can sometimes be used to avoid implementing
 * a scope handler from scratch, eg {@link NestedScopeHandler}.
 */
export interface ScopeHandler {
  /**
   * The scope type handled by this scope handler
   */
  readonly scopeType: ScopeType;

  /**
   * The scope type of the iteration scope of this scope type, or `undefined` if
   * there is no scope type corresponding to the iteration scope.  Note that
   * even when this property is `undefined`, all scope types should have an
   * iteration scope; it just may not correspond to one of our first-class scope
   * types.
   *
   * FIXME: Revisit this; maybe we should always find a way to make the
   * iteration scope a scope type.
   */
  readonly iterationScopeType: ScopeType | undefined;

  /**
   * Return all scope(s) touching the given position. A scope is considered to
   * touch a position if its domain contains the position or is directly
   * adjacent to the position. In other words, return all scopes for which the
   * following is true:
   *
   * ```typescript
   * scope.domain.start <= position && scope.domain.end >= position
   * ```
   *
   * If the position is directly adjacent to two scopes, return both. If no
   * scope touches the given position, return an empty list.
   *
   * Note that if this scope type is hierarchical, return only minimal scopes if
   * {@link ancestorIndex} is omitted or is 0.  Ie if scope A and scope B both
   * touch {@link position}, and scope A contains scope B, return scope B but
   * not scope A.
   *
   * If {@link ancestorIndex} is supplied and is greater than 0, throw a
   * {@link NotHierarchicalScopeError} if the scope type is not hierarchical.
   *
   * If the scope type is hierarchical, then if {@link ancestorIndex} is 1,
   * return all scopes touching {@link position} that have a child that is a
   * minimal scope touching {@link position} (ie they have a child that has an
   * {@link ancestorIndex} of 1 with respect to {@link position}).  If
   * {@link ancestorIndex} is 2, return all scopes touching {@link position}
   * that have a child with {@link ancestorIndex} of 1 with respect to
   * {@link position}, etc.
   *
   * The {@link ancestorIndex} parameter is primarily to be used by `"grand"`
   * scopes (#124).
   *
   * @param editor The editor containing {@link position}
   * @param position The position from which to expand
   * @param ancestorIndex If supplied, skip this many ancestors up the
   * hierarchy.
   */
  getScopesTouchingPosition(
    editor: TextEditor,
    position: Position,
    ancestorIndex?: number
  ): TargetScope[];

  /**
   * Return a list of all scopes that overlap with {@link range}.  A scope is
   * considered to overlap with a range if its domain has a non-empty
   * intersection with the range. In other words, return all scopes for which
   * the following is true:
   *
   * ```typescript
   * const intersection = scope.domain.intersection(range);
   * return intersection != null && !intersection.isEmpty;
   * ```
   *
   * @param editor The editor containing {@link range}
   * @param range The range with which to find overlapping scopes
   */
  getScopesOverlappingRange(editor: TextEditor, range: Range): TargetScope[];

  /**
   * Returns all iteration scopes touching {@link position}.  For example, if
   * scope type is `namedFunction`, and {@link position} is inside a class, the
   * iteration scope would contain a list of functions in the class.  An
   * iteration scope is considered to touch a position if its domain contains
   * the position or is directly adjacent to the position. In other words,
   * return all iteration scopes for which the following is true:
   *
   * ```typescript
   * iterationScope.domain.start <= position && iterationScope.domain.end >= position
   * ```
   *
   * If the position is directly adjacent to two iteration scopes, return both.
   * If no iteration scope touches the given position, return an empty list.
   *
   * Note that if the iteration scope type is hierarchical, return only minimal
   * iteration scopes, ie if iteration scope A and iteration scope B both touch
   * {@link position}, and iteration scope A contains iteration scope B, return
   * iteration scope B but not iteration scope A.
   *
   * @param editor The editor containing {@link position}
   * @param position The position from which to expand
   */
  getIterationScopesTouchingPosition(
    editor: TextEditor,
    position: Position
  ): IterationScope[];

  /**
   * Returns a scope before or after {@link position}, depending on
   * {@link direction}.  If {@link direction} is `"forward"`, consider all
   * scopes whose {@link Scope.domain.start} is equal or after
   * {@link position}.  If {@link direction} is `"backward"`, consider all
   * scopes whose {@link Scope.domain.end} is equal or before
   * {@link position}.  Note that {@link offset} will always be greater than or
   * equal to 1.  For example, an {@link offset} of 1 should return the first
   * scope after {@link position} (before if {@link direction} is
   * `"backward"`).
   * @param editor The editor containing {@link position}
   * @param position The position from which to start
   * @param offset Which scope before / after position to return
   * @param direction The direction to go relative to {@link position}
   */
  getScopeRelativeToPosition(
    editor: TextEditor,
    position: Position,
    offset: number,
    direction: Direction
  ): TargetScope;
}
