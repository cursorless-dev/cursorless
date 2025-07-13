import type { Modifier } from "@cursorless/common";
import type { StoredTargetMap } from "../core/StoredTargets";
import type { LanguageDefinitions } from "../languages/LanguageDefinitions";
import type { ModifierStageFactory } from "./ModifierStageFactory";
import type { ModifierStage } from "./PipelineStages.types";
import { ClassFunctionNameStage } from "./modifiers/ClassFunctionNameStage";
import { ModifyIfUntypedStage } from "./modifiers/ConditionalModifierStages";
import { ContainingScopeStage } from "./modifiers/ContainingScopeStage";
import { EveryScopeStage } from "./modifiers/EveryScopeStage";
import { FallbackStage } from "./modifiers/FallbackStage";
import {
  KeepContentFilterStage,
  KeepEmptyFilterStage,
} from "./modifiers/FilterStages";
import { HeadStage, TailStage } from "./modifiers/HeadTailStage";
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
      case "visible":
        return new VisibleStage(modifier);

      case "containingScope":
        if (ClassFunctionNameStage.use(modifier.scopeType)) {
          return new ClassFunctionNameStage(this, modifier);
        }
        return new ContainingScopeStage(
          this,
          this.scopeHandlerFactory,
          modifier,
        );

      case "preferredScope":
        if (ClassFunctionNameStage.use(modifier.scopeType)) {
          return new ClassFunctionNameStage(this, modifier);
        }
        return new PreferredScopeStage(
          this,
          this.scopeHandlerFactory,
          modifier,
        );

      case "everyScope":
        if (InstanceStage.use(modifier.scopeType)) {
          return new InstanceStage(this, this.storedTargets, modifier);
        }
        if (ClassFunctionNameStage.use(modifier.scopeType)) {
          return new ClassFunctionNameStage(this, modifier);
        }
        return new EveryScopeStage(this, this.scopeHandlerFactory, modifier);

      case "ordinalScope":
        if (InstanceStage.use(modifier.scopeType)) {
          return new InstanceStage(this, this.storedTargets, modifier);
        }
        if (ClassFunctionNameStage.use(modifier.scopeType)) {
          return new ClassFunctionNameStage(this, modifier);
        }
        return new OrdinalScopeStage(this, modifier);

      case "relativeScope":
        if (InstanceStage.use(modifier.scopeType)) {
          return new InstanceStage(this, this.storedTargets, modifier);
        }
        if (ClassFunctionNameStage.use(modifier.scopeType)) {
          return new ClassFunctionNameStage(this, modifier);
        }
        return new RelativeScopeStage(this.scopeHandlerFactory, modifier);

      case "keepContentFilter":
        return new KeepContentFilterStage(modifier);
      case "keepEmptyFilter":
        return new KeepEmptyFilterStage(modifier);
      case "fallback":
        return new FallbackStage(this, modifier);
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
}
