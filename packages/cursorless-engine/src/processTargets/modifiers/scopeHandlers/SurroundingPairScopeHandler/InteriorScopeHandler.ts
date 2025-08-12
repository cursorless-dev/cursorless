import type {
  Direction,
  InteriorScopeType,
  Position,
  ScopeType,
  TextEditor,
} from "@cursorless/common";
import { NoContainingScopeError, Range } from "@cursorless/common";
import type { LanguageDefinitions } from "../../../../languages/LanguageDefinitions";
import type { Target } from "../../../../typings/target.types";
import { InteriorTarget } from "../../../targets";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { FallbackScopeHandler } from "../FallbackScopeHandler";
import type { TargetScope } from "../scope.types";
import type {
  ComplexScopeType,
  ScopeHandler,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";
import { SortedScopeHandler } from "../SortedScopeHandler";

export class InteriorScopeHandler extends BaseScopeHandler {
  protected isHierarchical = true;

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private languageDefinitions: LanguageDefinitions,
    public readonly scopeType: InteriorScopeType,
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
    const targetDomain = new Range(position, hints.distalPosition);
    const scopeHandler = this.getScopeHandler();

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
      if (this.shouldYield(targetDomain, scope)) {
        yield createInteriorScope(scope);
      }
    }
  }

  private getScopeHandler(): ScopeHandler | undefined {
    const languageScopeHandler = this.languageDefinitions
      .get(this.languageId)
      ?.getScopeHandler(this.scopeType);

    const pairScopeHandler = this.scopeHandlerFactory.create(
      {
        type: "surroundingPair",
        delimiter: "any",
      },
      this.languageId,
    );

    // If the scope type is explicit (ie, the user has specified a scope
    // type), then we want to prioritize language scopes. For example,
    // if the user says "inside element" inside a `<div>` tag, the angle
    // brackets of the tag are also a surrounding pair which should have
    // lower priority.
    if (this.scopeType.explicitScopeType) {
      if (languageScopeHandler == null) {
        return pairScopeHandler;
      }
      return FallbackScopeHandler.createFromScopeHandlers([
        languageScopeHandler,
        pairScopeHandler,
      ]);
    }

    if (languageScopeHandler == null) {
      return pairScopeHandler;
    }

    return SortedScopeHandler.createFromScopeHandlers(
      this.scopeHandlerFactory,
      this.languageId,
      [pairScopeHandler, languageScopeHandler],
    );
  }

  private shouldYield(targetDomain: Range, scope: TargetScope): boolean {
    // For an explicit scope type we only yield scopes that are contained within
    // the target domain. For example, if the user said "inside token", we don't
    // want to yield scopes that are larger than the token.
    return (
      !this.scopeType.explicitScopeType || targetDomain.contains(scope.domain)
    );
  }
}

function createInteriorScope(scope: TargetScope): TargetScope {
  return {
    editor: scope.editor,
    domain: scope.domain,
    getTargets(isReversed) {
      return scope.getTargets(isReversed).flatMap(createInteriorTargets);
    },
  };
}

function createInteriorTargets(target: Target): Target[] {
  const interior = target.getInterior();
  if (interior != null) {
    return interior;
  }
  return [
    new InteriorTarget({
      editor: target.editor,
      isReversed: target.isReversed,
      fullInteriorRange: target.contentRange,
    }),
  ];
}
