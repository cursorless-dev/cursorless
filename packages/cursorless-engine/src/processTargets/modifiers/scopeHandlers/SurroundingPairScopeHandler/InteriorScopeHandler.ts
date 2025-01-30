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
import { BaseScopeHandler } from "../BaseScopeHandler";
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

    // No explicit scope type. Just yield all scopes.
    if (!this.scopeType.explicitScopeType) {
      yield* scopes;
      return;
    }

    const targetDomain = new Range(position, hints.distalPosition);

    // For an explicit scope type we only yield scopes that are contained within
    // the target domain. E.g the user said "inside token", then we don't want
    // to yield scopes that are larger than the token. The definition of an
    // interior is that it's inside the scope.

    for (const scope of scopes) {
      if (targetDomain.contains(scope.domain)) {
        yield scope;
      }
    }
  }

  private getScopeHandler(): ScopeHandler | undefined {
    const languageScopeHandler = this.languageDefinitions
      .get(this.languageId)
      ?.getScopeHandler(this.scopeType);

    // If the scope type is explicit (ie, the user has specified a scope
    // type), then we don't want to include matching pairs. The user might
    // have said something like "inside element" and then we don't want to
    // yield the interior of the `<div>` pair.

    if (this.scopeType.explicitScopeType) {
      if (languageScopeHandler == null) {
        return undefined;
      }
      return languageScopeHandler;
    }

    const pairInteriorScopeHandler = this.scopeHandlerFactory.create(
      {
        type: "surroundingPairInterior",
        delimiter: "any",
        allowWeakContainment: true,
      },
      this.languageId,
    );

    if (languageScopeHandler == null) {
      return pairInteriorScopeHandler;
    }

    return OneOfScopeHandler.createFromScopeHandlers(
      this.scopeHandlerFactory,
      {
        type: "oneOf",
        scopeTypes: [
          languageScopeHandler.scopeType,
          pairInteriorScopeHandler.scopeType!,
        ],
      },
      [languageScopeHandler, pairInteriorScopeHandler],
      this.languageId,
    );
  }
}
