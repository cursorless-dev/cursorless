import { NoContainingScopeError } from "../../errors";
import type { Target } from "../../typings/target.types";
import type { EveryScopeModifier } from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import getScopeHandler from "../getScopeHandler";
import type { ModifierStage } from "../PipelineStages.types";
import ItemStage from "./ItemStage";
import BoundedNonWhitespaceSequenceStage from "./scopeTypeStages/BoundedNonWhitespaceStage";
import ContainingSyntaxScopeStage, {
  SimpleEveryScopeModifier,
} from "./scopeTypeStages/ContainingSyntaxScopeStage";
import DocumentStage from "./scopeTypeStages/DocumentStage";
import LineStage from "./scopeTypeStages/LineStage";
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
        return this.runNew(target);
      default:
        return this.runLegacy(context, target);
    }
  }

  private runNew(target: Target): Target[] {
    const scopeHandler = getScopeHandler(this.modifier.scopeType);
    const iterationScope = scopeHandler.run(
      target.editor,
      target.contentRange,
      target.isReversed,
      target.hasExplicitRange
    );

    if (iterationScope.targets.length === 0) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    return iterationScope.targets;
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
    case "line":
      return new LineStage(modifier);
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
