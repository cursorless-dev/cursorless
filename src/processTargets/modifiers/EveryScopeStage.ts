import { NoContainingScopeError } from "../../errors";
import type { Target } from "../../typings/target.types";
import type { EveryScopeModifier } from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import getScopeHandler from "../getScopeHandler";
import type { ModifierStage } from "../PipelineStages.types";
import { getPreferredScope, getRightScope } from "./getPreferredScope";
import ItemStage from "./ItemStage";
import BoundedNonWhitespaceSequenceStage from "./scopeTypeStages/BoundedNonWhitespaceStage";
import ContainingSyntaxScopeStage, {
  SimpleEveryScopeModifier,
} from "./scopeTypeStages/ContainingSyntaxScopeStage";
import DocumentStage from "./scopeTypeStages/DocumentStage";
import NotebookCellStage from "./scopeTypeStages/NotebookCellStage";
import ParagraphStage from "./scopeTypeStages/ParagraphStage";
import {
  CustomRegexModifier,
  CustomRegexStage,
  NonWhitespaceSequenceStage,
  UrlStage,
} from "./scopeTypeStages/RegexStage";
import { CharacterStage, WordStage } from "./scopeTypeStages/SubTokenStages";

export class EveryScopeStage implements ModifierStage {
  constructor(private modifier: EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    switch (this.modifier.scopeType.type) {
      case "token":
      case "line":
        return this.runNew(target);
      default:
        return this.runLegacy(context, target);
    }
  }

  private runNew(target: Target): Target[] {
    const { editor, isReversed, contentRange: range } = target;
    const { scopeType } = this.modifier;

    const scopeHandler = getScopeHandler(scopeType);

    if (target.hasExplicitRange) {
      const scopes = scopeHandler.getScopesOverlappingRange(editor, range);

      if (scopes.length === 0) {
        throw new NoContainingScopeError(scopeType.type);
      }

      return scopes.map((scope) => scope.getTarget(isReversed));
    }

    const { start, end } = range;

    const startIterationScopes =
      scopeHandler.getIterationScopesTouchingPosition(editor, start);

    const startIterationScope = end.isEqual(start)
      ? getPreferredScope(startIterationScopes)
      : getRightScope(startIterationScopes);

    if (startIterationScope == null) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    if (!startIterationScope.domain.contains(end)) {
      // NB: This shouldn't really happen, because our weak scopes are
      // generally no bigger than a token.
      throw new Error(
        "Canonical iteration scope domain must include entire input range"
      );
    }

    return startIterationScope
      .getScopes()
      .map((scope) => scope.getTarget(isReversed));
  }

  private runLegacy(
    context: ProcessedTargetsContext,
    target: Target
  ): Target[] {
    const legacyStage = getEveryScopeStage(this.modifier);
    return legacyStage.run(context, target);
  }
}

const getEveryScopeStage = (modifier: EveryScopeModifier): ModifierStage => {
  switch (modifier.scopeType.type) {
    case "notebookCell":
      return new NotebookCellStage(modifier);
    case "document":
      return new DocumentStage(modifier);
    case "paragraph":
      return new ParagraphStage(modifier);
    case "nonWhitespaceSequence":
      return new NonWhitespaceSequenceStage(modifier);
    case "boundedNonWhitespaceSequence":
      return new BoundedNonWhitespaceSequenceStage(modifier);
    case "url":
      return new UrlStage(modifier);
    case "collectionItem":
      return new ItemStage(modifier);
    case "customRegex":
      return new CustomRegexStage(modifier as CustomRegexModifier);
    case "word":
      return new WordStage(modifier);
    case "character":
      return new CharacterStage(modifier);
    case "surroundingPair":
      throw Error(`Unsupported every scope ${modifier.scopeType.type}`);
    default:
      // Default to containing syntax scope using tree sitter
      return new ContainingSyntaxScopeStage(
        modifier as SimpleEveryScopeModifier
      );
  }
};
