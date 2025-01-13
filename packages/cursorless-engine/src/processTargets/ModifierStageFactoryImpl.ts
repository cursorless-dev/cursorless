import type {
  ContainingScopeModifier,
  EveryScopeModifier,
  Modifier,
} from "@cursorless/common";
import type { StoredTargetMap } from "../core/StoredTargets";
import type { LanguageDefinitions } from "../languages/LanguageDefinitions";
import type { ModifierStageFactory } from "./ModifierStageFactory";
import type { ModifierStage } from "./PipelineStages.types";
import { CascadingStage } from "./modifiers/CascadingStage";
import { ModifyIfUntypedStage } from "./modifiers/ConditionalModifierStages";
import { ContainingScopeStage } from "./modifiers/ContainingScopeStage";
import { EveryScopeStage } from "./modifiers/EveryScopeStage";
import {
  KeepContentFilterStage,
  KeepEmptyFilterStage,
} from "./modifiers/FilterStages";
import { HeadTailStage } from "./modifiers/HeadTailStage";
import { InstanceStage } from "./modifiers/InstanceStage";
import {
  ExcludeInteriorStage,
  InteriorOnlyStage,
} from "./modifiers/InteriorStage";
import { LeadingStage, TrailingStage } from "./modifiers/LeadingTrailingStages";
import { OrdinalScopeStage } from "./modifiers/OrdinalScopeStage";
import { EndOfStage, StartOfStage } from "./modifiers/PositionStage";
import { PreferredScopeStage } from "./modifiers/PreferredScopeStage";
import { RangeModifierStage } from "./modifiers/RangeModifierStage";
import { RawSelectionStage } from "./modifiers/RawSelectionStage";
import { RelativeScopeStage } from "./modifiers/RelativeScopeStage";
import { VisibleStage } from "./modifiers/VisibleStage";
import type { ScopeHandlerFactory } from "./modifiers/scopeHandlers/ScopeHandlerFactory";
import type {
  SimpleContainingScopeModifier,
  SimpleEveryScopeModifier,
} from "./modifiers/scopeTypeStages/LegacyContainingSyntaxScopeStage";
import { LegacyContainingSyntaxScopeStage } from "./modifiers/scopeTypeStages/LegacyContainingSyntaxScopeStage";
import { NotebookCellStage } from "./modifiers/scopeTypeStages/NotebookCellStage";

export class ModifierStageFactoryImpl implements ModifierStageFactory {
  constructor(
    private languageDefinitions: LanguageDefinitions,
    private storedTargets: StoredTargetMap,
    private scopeHandlerFactory: ScopeHandlerFactory,
  ) {
    this.create = this.create.bind(this);
  }

  create(modifier: Modifier): ModifierStage {
    switch (modifier.type) {
      case "startOf":
        return new StartOfStage();
      case "endOf":
        return new EndOfStage();
      case "extendThroughStartOf":
      case "extendThroughEndOf":
        return new HeadTailStage(this, modifier);
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
      case "visible":
        return new VisibleStage(modifier);
      case "containingScope":
        return new ContainingScopeStage(
          this,
          this.scopeHandlerFactory,
          modifier,
        );
      case "preferredScope":
        return new PreferredScopeStage(
          this,
          this.scopeHandlerFactory,
          modifier,
        );
      case "everyScope":
        if (modifier.scopeType.type === "instance") {
          return new InstanceStage(this, this.storedTargets, modifier);
        }
        return new EveryScopeStage(this, this.scopeHandlerFactory, modifier);
      case "ordinalScope":
        if (modifier.scopeType.type === "instance") {
          return new InstanceStage(this, this.storedTargets, modifier);
        }
        return new OrdinalScopeStage(this, modifier);
      case "relativeScope":
        if (modifier.scopeType.type === "instance") {
          return new InstanceStage(this, this.storedTargets, modifier);
        }
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
      default: {
        // Ensure we don't miss any new modifiers. Needed because we don't have input validation.
        // FIXME: remove once we have schema validation (#983)
        const _exhaustiveCheck: never = modifier;
        const { type } = modifier;
        throw new Error(`Unknown modifier: ${type}`);
      }
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
      default:
        // Default to containing syntax scope using tree sitter
        return new LegacyContainingSyntaxScopeStage(
          this.languageDefinitions,
          modifier as SimpleContainingScopeModifier | SimpleEveryScopeModifier,
        );
    }
  }
}
