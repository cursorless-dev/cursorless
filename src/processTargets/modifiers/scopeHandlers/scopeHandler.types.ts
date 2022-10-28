import type { Position, TextEditor } from "vscode";
import type {
  Direction,
  ScopeType,
} from "../../../typings/targetDescriptor.types";
import type { TargetScope } from "./scope.types";

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
   * Returns an iterable that yields scopes.
   *
   * If {@link direction} is `"forward"`, walk forward starting at
   * {@link position} (including position). Any time a scope's
   * {@link TargetScope.domain|domain} ends or starts, yield that scope.  If
   * multiple domains start or end at a particular point, break ties as follows:
   *
   * 1. First yield any scopes with empty domain.
   * 2. Then yield any scopes whose domains are ending, in reverse order of
   *    where they start.
   * 3. Then yield the scope with minimal domain that is starting. Any time you
   *    yield a scope, advance your position to the end of the scope, but when
   *    considering this new position, don't return this scope again.
   *
   * Note that once you have yielded a scope, you should not yield any scopes
   * contained by that scope.
   *
   * If {@link direction} is `"backward"`, walk backward starting at
   * {@link position} (including position). Any time a scope's
   * {@link TargetScope.domain|domain} ends or starts, yield that scope.  If
   * multiple domains start or end at a particular point, break ties as follows:
   *
   * 1. First yield any scopes with empty domain.
   * 2. Then yield any scopes whose domains are starting, in order of where they
   *    end.
   * 3. Then yield the scope with minimal domain that is ending. Any time you
   *    yield a scope, advance your position to the start of the scope, but when
   *    considering this new position, don't return this scope again.
   *
   * Note that the {@link requirements} argument can be ignored, but you may find
   * dramatic performance improvements by respecting the hints, especially if
   * the hints allow you to stop early.  For example, if
   * {@link ScopeIteratorRequirements.containment} is `"required"`, and your scope type
   * is not hierarchical, then you can stop once you get to the first scope that
   * doesn't contain {@link position}.
   *
   * @param editor The editor containing {@link position}
   * @param position The position from which to start
   * @param direction The direction to go relative to {@link position}
   * @param requirements Optional hints about which scopes should be returned
   */
  generateScopes(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    requirements?: ScopeIteratorRequirements,
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
   */
  containment?: ContainmentPolicy;

  /**
   * Indicates that the {@link TargetScope.domain|domain} of the scopes must
   * start before this position.  If the domain starts at the position, that is
   * *not* allowed.
   */
  distalPosition?: Position;
}
