import { NoContainingScopeError } from "../../errors";
import type { Target } from "../../typings/target.types";
import type {
  ContainingScopeModifier,
  ContainingSurroundingPairModifier,
} from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import getScopeHandler from "../getScopeHandler";
import type { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import ItemStage from "./ItemStage";
import BoundedNonWhitespaceSequenceStage from "./scopeTypeStages/BoundedNonWhitespaceStage";
import ContainingSyntaxScopeStage, {
  SimpleContainingScopeModifier,
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
import SurroundingPairStage from "./SurroundingPairStage";

export class ContainingScopeStage implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    switch (this.modifier.scopeType.type) {
      case "token":
        return this.runNew(target);
      default:
        return this.runLegacy(context, target);
    }
  }

  private runNew(target: Target): Target[] {
    const {
      isReversed,
      editor,
      contentRange: { start, end },
    } = target;
    const { scopeType } = this.modifier;

    const scopeHandler = getScopeHandler(scopeType);
    const startScope = scopeHandler.getScopeContainingPosition(editor, start);

    if (startScope.domain.contains(end)) {
      return [startScope.getTarget(isReversed)];
    }

    const endScope = scopeHandler.getScopeContainingPosition(editor, end);

    return constructScopeRangeTarget(isReversed, startScope, endScope);
  }

  private runLegacy(
    context: ProcessedTargetsContext,
    target: Target
  ): Target[] {
    const legacyStage = getContainingScopeStage(this.modifier);
    return legacyStage.run(context, target);
  }
}

const getContainingScopeStage = (
  modifier: ContainingScopeModifier
): ModifierStage => {
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
      return new SurroundingPairStage(
        modifier as ContainingSurroundingPairModifier
      );
    default:
      // Default to containing syntax scope using tree sitter
      return new ContainingSyntaxScopeStage(
        modifier as SimpleContainingScopeModifier
      );
  }
};
