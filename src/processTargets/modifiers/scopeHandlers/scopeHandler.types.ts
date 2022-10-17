import { Position, Range, TextEditor } from "vscode";
import { Target } from "../../../typings/target.types";
import { Direction } from "../../../typings/targetDescriptor.types";

/**
 * Represents a scope, which is a specific instantiation of a scope type,
 * eg a specific function, or a specific line or range of lines.  Contains
 * {@link target}, which represents the actual scope, as well as {@link domain},
 * which represents the range within which the given scope is canonical.  For
 * example, a scope representing the type of a parameter will have the entire
 * parameter as its domain, so that one can say "take type" from anywhere
 * within the parameter.
 */
export interface Scope {
  /**
   * The domain within which this scope is considered the canonical instance of
   * this scope type.  For example, if the scope type represents a `key` in a
   * key-value pair, then the pair would be the `domain`, so that "take key"
   * works from anywhere within the given pair.
   *
   * Most scopes will have a domain that is just the content range or removal
   * range of the scope.
   */
  domain: Range;

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
export interface IterationScope {
  /**
   * The domain within which this iteration scope is considered the canonical
   * iteration scope for the given scope type.  For example, if the scope type
   * is function, then the domain might be a class, so that "take every funk"
   * works from anywhere within the given class.
   */
  domain: Range;

  /**
   * The scopes in the given iteration scope.  Note that each scope has its own
   * domain.  We make this a function so that the scopes can be returned
   * lazily.
   */
  scopes: Scope[];
}

/**
 * Represents a scope type, containing functions that can be used to find
 * specific instances of the given scope type in a document.  For example, it
 * has  a function to find the scope containing a given position, a function to
 * find every instance of the scope in a range, etc.
 */
export interface ScopeHandler {
  /**
   * Given a position in a document, find the smallest scope containing the
   * given position. A scope is considered to contain the position even if it is
   * adjacent to the position. If the position is adjacent to two scopes, prefer
   * the one to the right.  If no scope contains the given position, return
   * `undefined`.
   * @param position The position from which to expand
   */
  getScopeContainingPosition(editor: TextEditor, position: Position): Scope;

  getScopesIntersectingRange(editor: TextEditor, range: Range): Scope[];

  /**
   * Returns the iteration scope containing {@link position}.  For example, if
   * the position is inside a class, the iteration scope could contain a list
   * of functions in the class.
   *
   * @param editor The editor containing {@link position}
   * @param position The position from which to expand
   */
  getIterationScopeContainingPosition(
    editor: TextEditor,
    position: Position
  ): IterationScope;

  getScopeRelativeToPosition(
    editor: TextEditor,
    position: Position,
    offset: number,
    direction: Direction
  ): Scope;
}
