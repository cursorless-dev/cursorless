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
  scopes: TargetScope[];
}

/**
 * Represents a scope type, containing functions that can be used to find
 * specific instances of the given scope type in a document.  For example, it
 * has  a function to find the scope containing a given position, a function to
 * find every instance of the scope in a range, etc.
 */
export interface ScopeHandler {
  /**
   * The scope type handled by this scope handler
   */
  scopeType: ScopeType;

  /**
   * Given a position in a document, find the smallest scope(s) containing the
   * given position. A scope is considered to contain the position even if it is
   * adjacent to the position. If the position is adjacent to two scopes, return
   * both. You can use {@link TargetScope.isPreferredOver} to indicate which one
   * should have precedence.  If no scope contains the given position, return
   * an empty list.
   * @param editor The editor containing {@link position}
   * @param position The position from which to expand
   */
  getScopesIntersectingPosition(
    editor: TextEditor,
    position: Position
  ): TargetScope[];

  getScopesIntersectingRange(editor: TextEditor, range: Range): TargetScope[];

  /**
   * Returns the iteration scope containing {@link position}.  For example, if
   * the position is inside a class, the iteration scope could contain a list of
   * functions in the class. A scope is considered to contain the position even
   * if it is adjacent to the position. If the position is adjacent to two
   * scopes, return both. You can use {@link TargetScope.isPreferredOver} to
   * indicate which one should have precedence.  If no iteration scope contains the given
   * position, throw {@link NoContainingScopeError}.
   *
   * @param editor The editor containing {@link position}
   * @param position The position from which to expand
   * @throws {NoContainingScopeError} If no iteration scope contains the given
   * position
   */
  getIterationScopesIntersectingPosition(
    editor: TextEditor,
    position: Position
  ): IterationScope[];

  /**
   * Returns a scope relative to {@link position}.  If {@link direction} is
   * `"forward"`, consider all scopes whose {@link Scope.domain.start} is equal
   * or after {@link position}.  If {@link direction} is `"backward"`, consider
   * all scopes whose {@link Scope.domain.end} is equal or before
   * {@link position}.  Note that {@link offset} will always be greater than or
   * equal to 1.  An {@link offset} of 1 should return the first scope after
   * {@link position} (before if {@link direction} is `"backward"`)
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
