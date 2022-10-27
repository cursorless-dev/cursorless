import { Position, TextEditor } from "vscode";
import { getScopeHandler } from ".";
import {
  Direction,
  OneOfScopeType,
} from "../../../typings/targetDescriptor.types";
import { getPreferredScope } from "../getPreferredScope";
import type { TargetScope } from "./scope.types";
import { ScopeHandler, ScopeIteratorHints } from "./scopeHandler.types";

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

  getPreferredScopeTouchingPosition(
    editor: TextEditor,
    position: Position,
  ): TargetScope | undefined {
    const candidateScopes = keepOnlyBottomLevelScopes(
      this.scopeHandlers
        .map((scopeHandler) =>
          scopeHandler.getPreferredScopeTouchingPosition(editor, position),
        )
        .filter((scope) => scope != null) as TargetScope[],
    );

    return getPreferredScope(candidateScopes);
  }

  *generateScopesRelativeToPosition(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints?: ScopeIteratorHints | undefined,
  ): Iterable<TargetScope> {
    const iterators = this.scopeHandlers.map((scopeHandler) =>
      scopeHandler
        .generateScopesRelativeToPosition(editor, position, direction, hints)
        [Symbol.iterator](),
    );

    let currentPosition = position;
    let iteratorInfos = getInitialIteratorInfos(iterators);

    while (iteratorInfos.length > 0) {
      iteratorInfos.sort((a, b) =>
        compareTargetScopes(direction, position, a.value, b.value),
      );

      const nextScope = iteratorInfos[0].value;
      yield nextScope;

      currentPosition =
        direction === "forward" ? nextScope.domain.end : nextScope.domain.start;

      iteratorInfos = advanceIterators(iteratorInfos, ({ domain }) =>
        direction === "forward"
          ? domain.end.isAfterOrEqual(currentPosition)
          : domain.start.isBeforeOrEqual(currentPosition),
      );
    }
  }
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

function getInitialIteratorInfos<T>(iterators: Iterator<T>[]) {
  return iterators.flatMap((iterator) => {
    const { value, done } = iterator.next();
    return done
      ? []
      : [
          {
            iterator,
            value,
          },
        ];
  });
}

function compareTargetScopes(
  direction: Direction,
  position: Position,
  { domain: a }: TargetScope,
  { domain: b }: TargetScope,
): number {
  const aContainsPosition = a.contains(position);
  const bContainsPosition = b.contains(position);
  const multiplier = direction === "forward" ? 1 : -1;
  const [proximalAttribute, distalAttribute] =
    direction === "forward"
      ? (["start", "end"] as const)
      : (["end", "start"] as const);

  if (aContainsPosition && bContainsPosition) {
    const value = multiplier * a[distalAttribute].compareTo(b[distalAttribute]);

    if (value === 0) {
      return -multiplier * a[proximalAttribute].compareTo(b[proximalAttribute]);
    }

    return value;
  }

  const aPosition = aContainsPosition
    ? a[distalAttribute]
    : a[proximalAttribute];
  const bPosition = bContainsPosition
    ? b[distalAttribute]
    : b[proximalAttribute];

  return multiplier * aPosition.compareTo(bPosition);
}

function advanceIterators<T>(
  iteratorInfos: {
    iterator: Iterator<T>;
    value: T;
  }[],
  criterion: (arg: T) => boolean,
) {
  return iteratorInfos.flatMap((iteratorInfo) => {
    const { iterator } = iteratorInfo;
    let { value } = iteratorInfo;

    let done: boolean | undefined = false;
    while (!criterion(value) && !done) {
      ({ value, done } = iterator.next());
    }

    if (done) {
      return [];
    }

    return [{ iterator, value }];
  });
}
