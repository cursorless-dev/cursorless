import { maxBy, minBy } from "lodash";
import { Position, Range, TextEditor } from "vscode";
import { getScopeHandler } from ".";
import {
  Direction,
  OneOfScopeType,
} from "../../../typings/targetDescriptor.types";
import { OutOfRangeError } from "../targetSequenceUtils";
import type { TargetScope } from "./scope.types";
import { ScopeHandler } from "./scopeHandler.types";

export default class OneOfScopeHandler implements ScopeHandler {
  private scopeHandlers: ScopeHandler[] = this.scopeType.scopeTypes.map(
    (scopeType) => {
      const handler = getScopeHandler(scopeType, this.languageId);
      if (handler == null) {
        throw new Error(`No available scope handler for '${scopeType.type}'`);
      }
      return handler;
    },
  );

  public iterationScopeType: OneOfScopeType = {
    type: "oneOf",
    scopeTypes: this.scopeHandlers.map(
      ({ iterationScopeType }) => iterationScopeType,
    ),
  };

  constructor(
    public readonly scopeType: OneOfScopeType,
    private languageId: string,
  ) {}

  getScopesTouchingPosition(
    editor: TextEditor,
    position: Position,
    ancestorIndex?: number,
  ): TargetScope[] {
    if (ancestorIndex !== 0) {
      // FIXME: We could support this one, but it will be a bit of work.
      throw new Error("`grand` not yet supported for compound scopes.");
    }

    return keepOnlyBottomLevelScopes(
      this.scopeHandlers.flatMap((scopeHandler) =>
        scopeHandler.getScopesTouchingPosition(editor, position, ancestorIndex),
      ),
    );
  }

  /**
   * We proceed as follows:
   *
   * 1. Get all scopes returned by
   *    {@link ScopeHandler.getScopesOverlappingRange} from each of
   *    {@link scopeHandlers}.
   * 2. If any of these scopes has a {@link TargetScope.domain|domain} that
   *    terminates within {@link range}, return all such maximal scopes.
   * 3. Otherwise, return a list containing just the minimal scope containing
   *    {@link range}.
   */
  getScopesOverlappingRange(editor: TextEditor, range: Range): TargetScope[] {
    const candidateScopes = this.scopeHandlers.flatMap((scopeHandler) =>
      scopeHandler.getScopesOverlappingRange(editor, range),
    );

    const scopesTerminatingInRange = candidateScopes.filter(
      ({ domain }) => !domain.contains(range),
    );

    return scopesTerminatingInRange.length > 0
      ? keepOnlyTopLevelScopes(scopesTerminatingInRange)
      : keepOnlyBottomLevelScopes(candidateScopes);
  }

  getScopeRelativeToPosition(
    editor: TextEditor,
    position: Position,
    offset: number,
    direction: Direction,
  ): TargetScope {
    let currentPosition = position;
    let currentScope: TargetScope;

    if (this.scopeHandlers.length === 0) {
      throw new OutOfRangeError();
    }

    for (let i = 0; i < offset; i++) {
      const candidateScopes = this.scopeHandlers.map((scopeHandler) =>
        scopeHandler.getScopeRelativeToPosition(
          editor,
          currentPosition,
          1,
          direction,
        ),
      );

      currentScope =
        direction === "forward"
          ? minBy(candidateScopes, ({ domain: start }) => start)!
          : maxBy(candidateScopes, ({ domain: end }) => end)!;

      currentPosition =
        direction === "forward"
          ? currentScope.domain.end
          : currentScope.domain.start;
    }

    return currentScope!;
  }
}

function keepOnlyTopLevelScopes(candidateScopes: TargetScope[]): TargetScope[] {
  return candidateScopes.filter(
    ({ domain }) =>
      !candidateScopes.some(({ domain: otherDomain }) =>
        otherDomain.contains(domain),
      ),
  );
}

function keepOnlyBottomLevelScopes(
  candidateScopes: TargetScope[],
): TargetScope[] {
  return candidateScopes.filter(
    ({ domain }) =>
      !candidateScopes.some(({ domain: otherDomain }) =>
        domain.contains(otherDomain),
      ),
  );
}
