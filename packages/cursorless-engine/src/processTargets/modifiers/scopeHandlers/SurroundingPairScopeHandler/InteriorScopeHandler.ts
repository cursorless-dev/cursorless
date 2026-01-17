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
import type { TreeSitterScopeHandler } from "../TreeSitterScopeHandler";

export class InteriorScopeHandler extends BaseScopeHandler {
  public readonly scopeType = { type: "interior" } as const;
  protected isHierarchical = true;

  static maybeCreate(
    languageDefinitions: LanguageDefinitions,
    languageId: string,
  ): InteriorScopeHandler | undefined {
    const scopeHandler = languageDefinitions
      .get(languageId)
      ?.getScopeHandler({ type: "interior" });

    if (scopeHandler == null) {
      return undefined;
    }

    return new InteriorScopeHandler(scopeHandler);
  }

  private constructor(private scopeHandler: TreeSitterScopeHandler) {
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
    const scopes = this.scopeHandler.generateScopes(
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
