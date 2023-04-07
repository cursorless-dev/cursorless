import {
  ContainingScopeModifier,
  EveryScopeModifier,
  Modifier,
  SurroundingPairModifier,
} from "@cursorless/common";
import { ModifierStageFactory } from "./ModifierStageFactory";
import { ModifierStage } from "./PipelineStages.types";
import CascadingStage from "./modifiers/CascadingStage";
import { ModifyIfUntypedStage } from "./modifiers/ConditionalModifierStages";
import { ContainingScopeStage } from "./modifiers/ContainingScopeStage";
import { EveryScopeStage } from "./modifiers/EveryScopeStage";
import {
  KeepContentFilterStage,
  KeepEmptyFilterStage,
} from "./modifiers/FilterStages";
import { HeadStage, TailStage } from "./modifiers/HeadTailStage";
import {
  ExcludeInteriorStage,
  InteriorOnlyStage,
} from "./modifiers/InteriorStage";
import ItemStage from "./modifiers/ItemStage";
import { LeadingStage, TrailingStage } from "./modifiers/LeadingTrailingStages";
import { OrdinalScopeStage } from "./modifiers/OrdinalScopeStage";
import PositionStage from "./modifiers/PositionStage";
import RangeModifierStage from "./modifiers/RangeModifierStage";
import RawSelectionStage from "./modifiers/RawSelectionStage";
import RelativeScopeStage from "./modifiers/RelativeScopeStage";
import SurroundingPairStage from "./modifiers/SurroundingPairStage";
import { ScopeHandlerFactory } from "./modifiers/scopeHandlers/ScopeHandlerFactory";
import BoundedNonWhitespaceSequenceStage from "./modifiers/scopeTypeStages/BoundedNonWhitespaceStage";
import ContainingSyntaxScopeStage, {
  SimpleContainingScopeModifier,
  SimpleEveryScopeModifier,
} from "./modifiers/scopeTypeStages/ContainingSyntaxScopeStage";
import NotebookCellStage from "./modifiers/scopeTypeStages/NotebookCellStage";
import {
  CustomRegexModifier,
  CustomRegexStage,
  NonWhitespaceSequenceStage,
  UrlStage,
} from "./modifiers/scopeTypeStages/RegexStage";

export class ModifierStageFactoryImpl implements ModifierStageFactory {
  constructor(private scopeHandlerFactory: ScopeHandlerFactory) {
    this.create = this.create.bind(this);
  }

  create(modifier: Modifier): ModifierStage {
    switch (modifier.type) {
      case "position":
        return new PositionStage(modifier);
      case "extendThroughStartOf":
        return new HeadStage(this, modifier);
      case "extendThroughEndOf":
        return new TailStage(this, modifier);
      case "toRawSelection":
        return new RawSelectionStage(modifier);
      case "interiorOnly":
        return new InteriorOnlyStage(this, modifier);
      case "excludeInterior":
        return new ExcludeInteriorStage(this, modifier);
      case "leading":
        return new LeadingStage(this, modifier);
      case "trailing":
        return new TrailingStage(this, modifier);
      case "containingScope":
        return new ContainingScopeStage(
          this,
          this.scopeHandlerFactory,
          modifier,
        );
      case "everyScope":
        return new EveryScopeStage(this, this.scopeHandlerFactory, modifier);
      case "ordinalScope":
        return new OrdinalScopeStage(this, modifier);
      case "relativeScope":
        return new RelativeScopeStage(this, this.scopeHandlerFactory, modifier);
      case "keepContentFilter":
        return new KeepContentFilterStage(modifier);
      case "keepEmptyFilter":
        return new KeepEmptyFilterStage(modifier);
      case "cascading":
        return new CascadingStage(this, modifier);
      case "modifyIfUntyped":
        return new ModifyIfUntypedStage(this, modifier);
      case "range":
        return new RangeModifierStage(this, modifier);
      case "inferPreviousMark":
        throw Error(
          `Unexpected modifier '${modifier.type}'; it should have been removed during inference`,
        );
    }
  }

  /**
   * Any scope type that has not been fully migrated to the new
   * {@link ScopeHandler} setup should have a branch in this `switch` statement.
   * Once the scope type is fully migrated, remove the branch and the legacy
   * modifier stage.
   *
   * Note that it is possible for a scope type to be partially migrated.  For
   * example, we could support modern scope handlers for a certain scope type in
   * Ruby, but not yet in Python.
   *
   * @param modifier The modifier for which to get the modifier stage
   * @returns A scope stage implementing the modifier for the given scope type
   */
  getLegacyScopeStage(
    modifier: ContainingScopeModifier | EveryScopeModifier,
  ): ModifierStage {
    switch (modifier.scopeType.type) {
      case "notebookCell":
        return new NotebookCellStage(modifier);
      case "nonWhitespaceSequence":
        return new NonWhitespaceSequenceStage(modifier);
      case "boundedNonWhitespaceSequence":
        return new BoundedNonWhitespaceSequenceStage(this, modifier);
      case "url":
        return new UrlStage(modifier);
      case "collectionItem":
        return new ItemStage(modifier);
      case "customRegex":
        return new CustomRegexStage(modifier as CustomRegexModifier);
      case "surroundingPair":
        return new SurroundingPairStage(modifier as SurroundingPairModifier);
      default:
        // Default to containing syntax scope using tree sitter
        return new ContainingSyntaxScopeStage(
          modifier as SimpleContainingScopeModifier | SimpleEveryScopeModifier,
        );
    }
  }
}
