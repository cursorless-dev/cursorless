import {
  NoContainingScopeError,
  Range,
  type Direction,
  type InteriorScopeType,
  type Position,
  type ScopeType,
  type TextEditor,
} from "@cursorless/common";
import type { LanguageDefinitions } from "../../../../languages/LanguageDefinitions";
import type { Target } from "../../../../typings/target.types";
import { InteriorTarget } from "../../../targets";
import { BaseScopeHandler } from "../BaseScopeHandler";
import { FallbackScopeHandler } from "../FallbackScopeHandler";
import { OneOfScopeHandler } from "../OneOfScopeHandler";
import type { TargetScope } from "../scope.types";
import type {
  ComplexScopeType,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";
import { type ScopeHandler } from "../scopeHandler.types";
import type { ScopeHandlerFactory } from "../ScopeHandlerFactory";

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
    // type), then we want to prioritize language scopes. The user might
    // have said something like "inside element" and then we don't want to
    // yield the interior of the `<div>` pair first.
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

    return OneOfScopeHandler.createFromScopeHandlers(
      this.scopeHandlerFactory,
      {
        type: "oneOf",
        scopeTypes: [
          languageScopeHandler.scopeType,
          pairScopeHandler.scopeType!,
        ],
      },
      [languageScopeHandler, pairScopeHandler],
      this.languageId,
    );
  }

  private shouldYield(targetDomain: Range, scope: TargetScope): boolean {
    // For an explicit scope type we only yield scopes that are contained within
    // the target domain. E.g the user said "inside token", then we don't want
    // to yield scopes that are larger than the token. The definition of an
    // interior is that it's inside the scope.

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
