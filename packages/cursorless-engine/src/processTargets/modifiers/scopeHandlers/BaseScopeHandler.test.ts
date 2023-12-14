import { TextEditor, Position, Direction, Range } from "@cursorless/common";
import { BaseScopeHandler } from "./BaseScopeHandler";
import { TargetScope } from "./scope.types";
import {
  CustomScopeType,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";
import { compareTargetScopes } from "./compareTargetScopes";
import assert from "assert";

class TestScopeHandler extends BaseScopeHandler {
  public scopeType = undefined;

  public get iterationScopeType(): CustomScopeType {
    throw new Error("Method not implemented.");
  }

  constructor(
    private scopes: TargetScope[],
    public isHierarchical: boolean,
  ) {
    super();
  }

  protected *generateScopeCandidates(
    _editor: TextEditor,
    _position: Position,
    _direction: Direction,
    _hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    yield* this.scopes;
  }
}

interface DummyScope {
  /** Start offset of scope's domain */
  start: number;

  /** End offset of scope's domain */
  end: number;

  /** Indicates whether we expect this scope to be yielded */
  shouldYield: boolean;
}

type Hints = Omit<Partial<ScopeIteratorRequirements>, "distalPosition"> & {
  distalPosition?: number;
};

interface TestCase {
  name: string;
  isHierarchical: boolean;
  hints: Hints;
  position: number;
  direction: Direction;
  scopes: DummyScope[];
  documentEnd?: number;
}

/** These are the actual test cases.  Everything else is scaffolding */
const testCases: TestCase[] = [
  {
    name: "should yield all scopes in simple case",
    isHierarchical: false,
    hints: {},
    position: 0,
    direction: "forward",
    scopes: [{ start: 0, end: 2, shouldYield: true }],
  },

  {
    name: "should handle skipAncestorScopes with required containment",
    isHierarchical: true,
    hints: {
      containment: "required",
      skipAncestorScopes: true,
    },
    position: 1,
    direction: "forward",
    scopes: [
      { start: 2, end: 3, shouldYield: false },
      { start: 0, end: 4, shouldYield: true },
    ],
  },

  {
    name: "should handle skipAncestorScopes with required containment in between scopes",
    isHierarchical: true,
    hints: {
      containment: "required",
      skipAncestorScopes: true,
      allowAdjacentScopes: true,
    },
    position: 2,
    direction: "forward",
    scopes: [
      { start: 1, end: 2, shouldYield: true },
      // Skip next because we skip ancestor scopes
      { start: 0, end: 2, shouldYield: false },
      { start: 2, end: 3, shouldYield: true },
    ],
  },

  {
    name: "should handle skipAncestorScopes with optional containment",
    isHierarchical: true,
    hints: {
      skipAncestorScopes: true,
      distalPosition: 3,
    },
    position: 2,
    direction: "forward",
    scopes: [
      { start: 2, end: 3, shouldYield: true },
      { start: 0, end: 3, shouldYield: false },
    ],
  },
];

suite("BaseScopeHandler", () => {
  testCases.forEach((testCase) => {
    test(testCase.name, () => {
      const editor = {
        document: { range: toRange(0, testCase.documentEnd ?? Infinity) },
      } as TextEditor;
      const position = toPosition(testCase.position);

      const inputScopes = testCase.scopes.map((scope) => ({
        editor,
        domain: toRange(scope.start, scope.end),
        getTargets: () => undefined as any,
      }));

      assert.deepStrictEqual(
        [...inputScopes]
          .sort((a, b) =>
            compareTargetScopes(testCase.direction, position, a, b),
          )
          .map(fromScope),
        inputScopes.map(fromScope),
        "input scopes must be sorted",
      );

      const handler = new TestScopeHandler(
        inputScopes,
        testCase.isHierarchical,
      );

      const hints = {
        ...testCase.hints,
        distalPosition:
          testCase.hints.distalPosition == null
            ? undefined
            : toPosition(testCase.hints.distalPosition),
      };

      const actualScopes = Array.from(
        handler.generateScopes(editor, position, testCase.direction, hints),
      ).map(fromScope);

      const expectedScopes = testCase.scopes
        .filter((scope) => scope.shouldYield)
        .map(({ start, end }) => ({ start, end }));

      assert.deepStrictEqual(actualScopes, expectedScopes);
    });
  });
});

function fromScope(scope: TargetScope) {
  return {
    start: fromPosition(scope.domain.start),
    end: fromPosition(scope.domain.end),
  };
}

function fromPosition(position: Position): number {
  return position.character;
}

function toPosition(offset: number): Position {
  return new Position(0, offset);
}

function toRange(start: number, end: number): Range {
  return new Range(0, start, 0, end);
}
