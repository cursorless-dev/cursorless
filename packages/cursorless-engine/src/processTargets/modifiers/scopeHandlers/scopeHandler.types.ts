import type { Position, TextEditor } from "@cursorless/common";
import type { Direction, ScopeType } from "@cursorless/common";
import type { TargetScope } from "./scope.types";

/**
 * Used to handle a scope internally that doesn't have a well-defined scope
 * type. Primarily used for iteration scopes, where the iteration scope doesn't
 * correspond to a scope type that can be used directly by the user as a scope.
 */
export interface CustomScopeType {
  type: "custom";
  scopeHandler: ScopeHandler;
}

/**
 * Represents a scope type.  The functions in this interface allow us to find
 * specific instances of the given scope type in a document. These functions are
 * used by the various modifier stages to implement modifiers that involve the
 * given scope type, such as containing, every, next, etc.
 *
 * Note that some scope types are hierarchical, ie one scope of the given type
 * can contain another scope of the same type.  For example, a function can
 * contain other functions, so functions are hierarchical.  Surrounding pairs
 * are also hierarchical, as they can be nested.  Many scope types are not
 * hierarchical, though, eg line, token, word, etc.
 *
 * Note also that scope's domains are never allowed to partially overlap.
 * Scopes can be directly adjacent to one another, or have one or more
 * characters between them, or, for hierarchical scopes, one scope can
 * completely contain another scope.
 *
 * Note that there are helpers that can sometimes be used to avoid implementing
 * a scope handler from scratch, eg {@link NestedScopeHandler}.
 */
export interface ScopeHandler {
  /**
   * The scope type handled by this scope handler, or `undefined` if this scope
   * handler doesn't have a well-defined scope type.
   */
  readonly scopeType: ScopeType | undefined;

  /**
   * The scope type of the default iteration scope of this scope type.  This
   * scope type will be used when the input target has no explicit range (ie
   * {@link Target.hasExplicitRange} is `false`).
   */
  readonly iterationScopeType: ScopeType | CustomScopeType;

  /**
   * Returns an iterable of scopes meeting the requirements in
   * {@link requirements}, yielded in a specific order.  See
   * {@link generateScopeCandidates} and {@link compareTargetScopes} for more on
   * the order.
   *
   * @param editor The editor containing {@link position}
   * @param position The position from which to start
   * @param direction The direction to go relative to {@link position}
   * @param requirements Extra requirements of the scopes being returned
   * @returns An iterable of scopes
   */
  generateScopes(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    requirements?: Partial<ScopeIteratorRequirements>,
  ): Iterable<TargetScope>;

  /**
   * This optional function can be defined to indicate a preference when the
   * containing scope modifier is applied to an empty target that is directly in
   * between two instances of scope.  By default we prefer the right scope, but
   * if you define this function you can indicate another way to break these
   * ties.
   * @param scopeA A scope
   * @param scopeB Another scope
   * @returns A boolean indicating if {@link scopeA} is preferred over
   * {@link scopeB}.  A value of `undefined` indicates no preference.
   */
  isPreferredOver?(
    scopeA: TargetScope,
    scopeB: TargetScope,
  ): boolean | undefined;

  /**
   * Whether to include adjacent scopes when used in an "every" modifier.  This
   * was added so that "every line" will include the line you're on even if your
   * range is at the beginning or end of the line.
   */
  readonly includeAdjacentInEvery: boolean;
}

export type ContainmentPolicy =
  | "required"
  | "disallowed"
  | "disallowedIfStrict";

export interface ScopeIteratorRequirements {
  /**
   * Indicates whether the scopes must / must not contain the input position.
   * The values are as follows:
   *
   * - `"required"` means that the scope's {@link TargetScope.domain|domain}
   *   must contain position.  If position is directly adjacent to the domain,
   *   that counts as containment
   * - `"disallowed"` means that the scope's {@link TargetScope.domain|domain}
   *   may not contain position.  If position is directly adjacent to the
   *   domain, that is also disallowed
   * - `"disallowedIfStrict"` means that the scope's
   *   {@link TargetScope.domain|domain} may not strictly contain position.  If
   *   position is directly adjacent to the domain, that *is* allowed.
   * - `null` means that we don't care whether {@link TargetScope.domain|domain}
   *   contains position or not
   *
   * @default null
   */
  containment: ContainmentPolicy | null;

  /**
   * Indicates that the {@link TargetScope.domain|domain} of the scopes must
   * start at or before this position for `"forward"`, or at or after this
   * position for `"backward"`.  If {@link allowAdjacentScopes} is `false`, then
   * the domain must start strictly before this position (after for
   * `"backward").
   *
   * Defaults to the end of the document for `"forward"`, or the start of the
   * document for `"backward"`.
   */
  distalPosition: Position;

  /**
   * Indicates that the {@link TargetScope.domain|domain} of the scopes is
   * allowed to have empty overlap with the range `(position, distalPosition)`.
   * If `false`, the domain must have nonempty overlap with `(position,
   * distalPosition)`, unless the domain is empty.
   *
   * @default false
   */
  allowAdjacentScopes: boolean;

  /**
   * Indicates whether the ScopeHandler should skip yielding a scope if it is an
   * ancestor of any scope that has been previously yielded.
   *
   * - `true` means that ancestor scopes of any previously yielded scope will
   *   not be yielded.
   * - `false` means that all ancestor scopes of any previously yielded scope
   *   will be yielded.
   *
   * @default false
   */
  skipAncestorScopes: boolean;

  includeDescendantScopes: boolean;
}
