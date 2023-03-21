import { Modifier } from "@cursorless/common";
import CascadingStage from "./modifiers/CascadingStage";
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
import { LeadingStage, TrailingStage } from "./modifiers/LeadingTrailingStages";
import { ModifyIfUntypedStage } from "./modifiers/ConditionalModifierStages";
import { OrdinalScopeStage } from "./modifiers/OrdinalScopeStage";
import PositionStage from "./modifiers/PositionStage";
import RangeModifierStage from "./modifiers/RangeModifierStage";
import RawSelectionStage from "./modifiers/RawSelectionStage";
import RelativeScopeStage from "./modifiers/RelativeScopeStage";
import { ModifierStage } from "./PipelineStages.types";

export default (modifier: Modifier): ModifierStage => {
  switch (modifier.type) {
    case "position":
      return new PositionStage(modifier);
    case "extendThroughStartOf":
      return new HeadStage(modifier);
    case "extendThroughEndOf":
      return new TailStage(modifier);
    case "toRawSelection":
      return new RawSelectionStage(modifier);
    case "interiorOnly":
      return new InteriorOnlyStage(modifier);
    case "excludeInterior":
      return new ExcludeInteriorStage(modifier);
    case "leading":
      return new LeadingStage(modifier);
    case "trailing":
      return new TrailingStage(modifier);
    case "containingScope":
      return new ContainingScopeStage(modifier);
    case "everyScope":
      return new EveryScopeStage(modifier);
    case "ordinalScope":
      return new OrdinalScopeStage(modifier);
    case "relativeScope":
      return new RelativeScopeStage(modifier);
    case "keepContentFilter":
      return new KeepContentFilterStage(modifier);
    case "keepEmptyFilter":
      return new KeepEmptyFilterStage(modifier);
    case "cascading":
      return new CascadingStage(modifier);
    case "modifyIfUntyped":
      return new ModifyIfUntypedStage(modifier);
    case "range":
      return new RangeModifierStage(modifier);
    case "inferPreviousMark":
      throw Error(
        `Unexpected modifier '${modifier.type}'; it should have been removed during inference`,
      );
  }
};
