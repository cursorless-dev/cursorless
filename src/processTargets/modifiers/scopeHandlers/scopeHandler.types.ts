import { Position, Range, TextEditor } from "vscode";
import { ScopeType } from "../../../core/commandVersionUpgrades/upgradeV2ToV3/targetDescriptorV2.types";
import { Target } from "../../../typings/target.types";
import { Direction } from "../../../typings/targetDescriptor.types";

/**
 * A range in the document within which a particular scope type is considered
 * to own the given region.  We use this type both to define the domain within
 * which a target is canonical, and the domain within which an iteration scope
 * is canonical.
 */
export interface Scope {
  /**
   * The text editor containing {@link domain}.
   */
  editor: TextEditor;

  /**
   * The domain within which this scope is considered the canonical instance of
   * this scope type.  For example, if the scope type represents a `key` in a
   * key-value pair, then the pair would be the `domain`, so that "take key"
   * works from anywhere within the given pair.
   *
   * Most scopes will have a domain that is just the content range or removal
   * range of the scope.
   *
   * For an iteration scope, indicates the domain within which this iteration scope is considered the canonical
   * iteration scope for the given scope type.  For example, if the scope type
   * is function, then the domain might be a class, so that "take every funk"
   * works from anywhere within the given class.
   */
  domain: Range;

  /**
   * This fuction can be defined to indicate how to choose between adjacent
   * scopes.  If the input target is zero width, and between two adjacent
   * scopes, this funciton will be used to decide which scope is considered to
   * contain the input target.  If this function is `undefined`, or returns
   * `undefined`, then the one to the right will be preferred.
   * @param other The scope to compare to
   */
  isPreferredOver?(other: Scope): boolean | undefined;
}

/**
 * Represents a scope, which is a specific instantiation of a scope type,
 * eg a specific function, or a specific line or range of lines.  Contains
 * {@link target}, which represents the actual scope, as well as {@link domain},
 * which represents the range within which the given scope is canonical.  For
 * example, a scope representing the type of a parameter will have the entire
 * parameter as its domain, so that one can say "take type" from anywhere
 * within the parameter.
 */
export interface TargetScope extends Scope {
  /**
   * The target that represents this scope.  Note that the target can represent
   * a contiguous range of instances of the given scope type, eg a range from
   * one function to another or a line range.
   */
  getTarget(isReversed: boolean): Target;
}

/**
 * Represents an iteration scope, which is a domain containing one or more
 * scopes that are considered siblings for use with `"every"`. This type
 * contains {@link getScopes}, which is a list of the actual scopes, as well as
 * {@link domain}, which represents the range within which the given iteration
 * scope is canonical.  For example, an iteration scope for the scope type
 * `functionOrParameter` might have a class as its domain and its targets would
 * be the functions in the class. This way one can say "take every funk" from
 * anywhere within the class.
 */
export interface IterationScope extends Scope {
  /**
   * The scopes in the given iteration scope.  Note that each scope has its own
   * domain.  We make this a function so that the scopes can be returned
   * lazily.
   */
  getScopes(): TargetScope[];
}

/**
 * Represents a scope type.  The functions in this interface allow us to find
 * specific instances of the given scope type in a document.  For example, it
 * has a function to find the scopes touching a given position, a function to
 * find every instance of the scope overlapping a range, etc. These functions
 * are used by the various modifier stages to implement modifiers that involve
 * the given scope type.
 *
 * Note that a scope type can be hierarchical, ie one scope of the given type
 * can contain another scope of the same type.  For example, a function can
 * contain other functions, so functions are hierarchical.  Surrounding pairs
 * are also hierarchical, as they can be nested.  Many scope types are not
 * hierarchical, though, eg line, token, word, etc.
 *
 * In the case of a hierarchical scope type, these functions should never
 * return scopes that contain one another.  Ie if we return a surrounding pair,
 * we shouldn't also return any surrounding pairs contained within, or if we
 * return a function, we shouldn't also return a function nested within that
 * function.
 *
 * Note that there are helpers that can sometimes be used to avoid implementing
 * a scope handler from scratch, eg {@link NestedScopeHandler}.
 */
export interface ScopeHandler {
  /**
   * The scope type handled by this scope handler
   */
  scopeType: ScopeType;

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
   * If the position is directly adjacent to two scopes, return both. You can
   * use {@link TargetScope.isPreferredOver} to indicate which one should have
   * precedence.  If no scope contains the given position, return an empty
   * list.
   *
   * Note that if this scope type is hierarchical, return only minimal scopes,
   * ie if scope A and scope B both touch {@link position}, and scope A contains
   * scope B, return scope B but not scope A.
   * @param editor The editor containing {@link position}
   * @param position The position from which to expand
   */
  getScopesTouchingPosition(
    editor: TextEditor,
    position: Position
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
   * iteration scope would contain a list of functions in the class.  A scope
   * is considered to touch a position if its domain contains the position or
   * is directly adjacent to the position. In other words, return all iteration
   * scopes for which the following is true:
   *
   * ```typescript
   * iterationScope.domain.start <= position && iterationScope.domain.end >= position
   * ```
   *
   * If the position is directly adjacent to two iteration scopes, return both.
   * You can use {@link TargetScope.isPreferredOver} to indicate which one
   * should have precedence.  If no iteration scope contains the given
   * position, return an empty list.
   *
   * Note that if the iteration scope type is hierarchical, return only minimal
   * scopes, ie if iteration scope A and iteration scope B both touch
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
   * scope after {@link position} (before if {@link direction} is `"backward"`)
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
