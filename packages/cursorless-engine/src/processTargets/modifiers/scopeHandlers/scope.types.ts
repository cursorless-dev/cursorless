import { Range, TextEditor } from "@cursorless/common";
import type { Target } from "../../../typings/target.types";

/**
 * Represents a scope, which is a specific instantiation of a scope type,
 * eg a specific function, or a specific line or range of lines.  Contains
 * {@link getTargets}, which represents the actual scope, as well as
 * {@link domain}, which represents the range within which the given scope is
 * canonical.  For example, a scope representing the type of a parameter will
 * have the entire parameter as its domain, so that one can say "take type"
 * from anywhere within the parameter.
 */
export interface TargetScope {
  /**
   * The text editor containing {@link domain}.
   */
  readonly editor: TextEditor;

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
  readonly domain: Range;

  /** Whether this scope could expand contiguously to its siblings. */
  readonly contiguous?: boolean;

  /**
   * The targets corresponding to this scope.  Note that there will almost
   * always be exactly one target, but there are some exceptions, eg "tags" in
   * HTML / jsx
   */
  getTargets(isReversed: boolean): Target[];
}
