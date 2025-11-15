import type {
  Direction,
  Position,
  ScopeType,
  TextEditor,
} from "@cursorless/common";
import { NoContainingScopeError } from "@cursorless/common";
import type { LanguageDefinitions } from "../../../../languages/LanguageDefinitions";
import type { Target } from "../../../../typings/target.types";
import { InteriorTarget } from "../../../targets";
import { BaseScopeHandler } from "../BaseScopeHandler";
import type { TargetScope } from "../scope.types";
import type {
  ComplexScopeType,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";

export class InteriorScopeHandler extends BaseScopeHandler {
  protected isHierarchical = true;

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private languageDefinitions: LanguageDefinitions,
    public readonly scopeType: ScopeType,
    private languageId: string,
  ) {
    super();
  }

  get iterationScopeType(): ScopeType | ComplexScopeType {
    throw new NoContainingScopeError(
      "Iteration scope for InteriorScopeHandler",
    );
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const scopeHandler = this.languageDefinitions
      .get(this.languageId)
      ?.getScopeHandler(this.scopeType);

    if (scopeHandler == null) {
      return;
    }

    const scopes = scopeHandler.generateScopes(
      editor,
      position,
      direction,
      hints,
    );

    for (const scope of scopes) {
      yield createScope(scope);
    }
  }
}

function createScope(scope: TargetScope): TargetScope {
  return {
    editor: scope.editor,
    domain: scope.domain,
    getTargets(isReversed) {
      return scope.getTargets(isReversed).map(createInteriorTarget);
    },
  };
}

function createInteriorTarget(target: Target): InteriorTarget {
  return new InteriorTarget({
    editor: target.editor,
    isReversed: target.isReversed,
    fullInteriorRange: target.contentRange,
  });
}
