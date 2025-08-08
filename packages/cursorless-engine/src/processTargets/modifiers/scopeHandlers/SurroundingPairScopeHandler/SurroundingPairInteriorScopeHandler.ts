import type {
  Direction,
  Position,
  SurroundingPairInteriorScopeType,
  TextEditor,
} from "@cursorless/common";
import { BaseScopeHandler } from "../BaseScopeHandler";
import type { TargetScope } from "../scope.types";
import type {
  ScopeHandler,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";

export class SurroundingPairInteriorScopeHandler extends BaseScopeHandler {
  protected isHierarchical = true;
  private surroundingPairScopeHandler: ScopeHandler;

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    public readonly scopeType: SurroundingPairInteriorScopeType,
    private languageId: string,
  ) {
    super();

    this.surroundingPairScopeHandler = this.scopeHandlerFactory.create(
      {
        type: "surroundingPair",
        delimiter: this.scopeType.delimiter,
        requireStrongContainment: true,
      },
      this.languageId,
    );
  }

  get iterationScopeType() {
    return this.surroundingPairScopeHandler.iterationScopeType;
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const scopes = this.surroundingPairScopeHandler.generateScopes(
      editor,
      position,
      direction,
      hints,
    );

    for (const scope of scopes) {
      yield {
        editor,
        domain: scope.domain,
        getTargets(isReversed) {
          return scope
            .getTargets(isReversed)
            .flatMap((target) => target.getInterior()!);
        },
      };
    }
  }
}
