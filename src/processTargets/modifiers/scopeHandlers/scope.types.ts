import { Range, TextEditor } from "vscode";
import { Target } from "../../../typings/target.types";

/**
 * A range in the document within which a particular scope type is considered
 * the canonical instance of the given region.  We use this type both to define
 * the domain within which a target is canonical, and the domain within which
 * an iteration scope is canonical.
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
 * {@link getTarget}, which represents the actual scope, as well as
 * {@link domain}, which represents the range within which the given scope is
 * canonical.  For example, a scope representing the type of a parameter will
 * have the entire parameter as its domain, so that one can say "take type"
 * from anywhere within the parameter.
 */
export interface TargetScope extends Scope {
  /**
   * The target corresponding to this scope.
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
