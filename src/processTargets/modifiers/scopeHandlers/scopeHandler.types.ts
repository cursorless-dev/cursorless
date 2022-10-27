import type { Position, Range, TextEditor } from "vscode";
import type {
  Direction,
  ScopeType,
} from "../../../typings/targetDescriptor.types";
import type { TargetScope } from "./scope.types";

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
   * The scope type of the default iteration scope of this scope type.  This
   * scope type will be used when the input target has no explicit range (ie
   * {@link Target.hasExplicitRange} is `false`).
   */
  readonly iterationScopeType: ScopeType;

  /**
   * Return the preferred scope touching the given position. A scope is
   * considered to touch a position if its {@link TargetScope.domain|domain}
   * contains the position or is directly adjacent to the position. In other
   * words, return all scopes for which the following is true:
   *
   * ```typescript
   * scope.domain.start <= position && scope.domain.end >= position
   * ```
   *
   * If the position is directly adjacent to two scopes, return the preferred
   * scope.  This will generallly be the rightmost scope. If no scope touches
   * the given position, return `undefined`.
   *
   * Note that if this scope type is hierarchical, return only minimal scopes.
   * Ie if scope A and scope B both touch {@link position}, and scope A contains
   * scope B, return scope B but not scope A.
   *
   * @param editor The editor containing {@link position}
   * @param position The position from which to expand
   */
  getPreferredScopeTouchingPosition(
    editor: TextEditor,
    position: Position,
  ): TargetScope | undefined;

  /**
   * Returns a scope before or after {@link position}, depending on
   * {@link direction}.  If {@link direction} is `"forward"` and {@link offset}
   * is 1, return the leftmost scope whose {@link TargetScope.domain|domain}'s
   * {@link Range.start|start} is equal or after {@link position}.  If
   * {@link direction} is `"forward"` and {@link offset} is 2, return the
   * leftmost scope whose {@link TargetScope.domain|domain}'s
   * {@link Range.start|start} is equal or after the {@link Range.end|end} of
   * {@link TargetScope.domain|domain} of the scope at `offset` 1.  Etc.
   *
   * If {@link direction} is `"backward"` and {@link offset} is 1, return the
   * rightmost scope whose {@link TargetScope.domain|domain}'s
   * {@link Range.end|end} is equal or before {@link position}.  If
   * {@link direction} is `"backward"` and {@link offset} is 2, return the
   * rightmost scope whose {@link TargetScope.domain|domain}'s
   * {@link Range.end|end} is equal or before the {@link Range.start|start} of
   * {@link TargetScope.domain|domain} of the scope at `offset` 1.  Etc.
   *
   * Note that {@link offset} will always be greater than or equal to 1.
   *
   * @param editor The editor containing {@link position}
   * @param position The position from which to start
   * @param offset Which scope before / after position to return
   * @param direction The direction to go relative to {@link position}
   */
  generateScopesRelativeToPosition(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints?: ScopeIteratorHints,
  ): Iterable<TargetScope>;
}

export type ContainmentPolicy = "required" | "disallowed" | "disallowedStrict";

export interface ScopeIteratorHints {
  containment?: ContainmentPolicy;
  mustStartBefore?: Position;
}
