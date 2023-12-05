import type {
  ContiguousScopeModifier,
  Direction,
  Position,
  TextEditor,
} from "@cursorless/common";
import { NoContainingScopeError, Range } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";
import { TargetScope } from "./scopeHandlers/scope.types";
import { ScopeHandler } from "./scopeHandlers/scopeHandler.types";

export class ContiguousScopeStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifier: ContiguousScopeModifier,
  ) {}

  run(target: Target): Target[] {
    const { scopeType } = this.modifier;
    const { editor, contentRange } = target;

    const scopeHandler = this.scopeHandlerFactory.create(
      scopeType,
      editor.document.languageId,
    );

    if (scopeHandler == null) {
      throw new NoContainingScopeError(scopeType.type);
    }

    const targets = [
      ...getScopes(scopeHandler, editor, contentRange.start, "backward"),
      ...getScopes(scopeHandler, editor, contentRange.end, "forward"),
    ]
      .filter((scope) => scope != null)
      .flatMap((scope) => scope?.getTargets(false) ?? []);

    if (targets.length === 0) {
      throw new NoContainingScopeError(scopeType.type);
    }

    let newContentRange = targets[0].contentRange;

    for (const target of targets) {
      newContentRange = newContentRange.union(target.contentRange);
    }

    return [targets[0].withContentRange(newContentRange)];
  }
}

function getScopes(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  position: Position,
  direction: Direction,
): [TargetScope | undefined, TargetScope | undefined] {
  let first, last: TargetScope | undefined;

  const generator = scopeHandler.generateScopes(editor, position, direction, {
    skipAncestorScopes: true,
  });

  for (const scope of generator) {
    if (first == null || last == null) {
      first = scope;
      last = scope;
      continue;
    }

    const [previousScope, nextScope] = (() => {
      if (direction === "forward") {
        return [last, scope];
      }
      return [scope, last];
    })();

    if (isAdjacent(editor, previousScope, nextScope)) {
      last = scope;
    }
  }

  return [first, last];
}

function isAdjacent(
  editor: TextEditor,
  previousScope: TargetScope,
  nextScope: TargetScope,
): boolean {
  const rangeBetween = new Range(
    previousScope.domain.end,
    nextScope.domain.start,
  );
  const text = editor.document.getText(rangeBetween);
  return /^\s*$/.test(text);
}
