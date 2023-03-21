import type {
  ContainingScopeModifier,
  EveryScopeModifier,
  SurroundingPairModifier,
} from "@cursorless/common";
import type { ModifierStage } from "../PipelineStages.types";
import ItemStage from "./ItemStage";
import BoundedNonWhitespaceSequenceStage from "./scopeTypeStages/BoundedNonWhitespaceStage";
import ContainingSyntaxScopeStage, {
  SimpleContainingScopeModifier,
  SimpleEveryScopeModifier,
} from "./scopeTypeStages/ContainingSyntaxScopeStage";
import NotebookCellStage from "./scopeTypeStages/NotebookCellStage";
import {
  CustomRegexModifier,
  CustomRegexStage,
  NonWhitespaceSequenceStage,
  UrlStage,
} from "./scopeTypeStages/RegexStage";
import SurroundingPairStage from "./SurroundingPairStage";

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
export default function getLegacyScopeStage(
  modifier: ContainingScopeModifier | EveryScopeModifier,
): ModifierStage {
  switch (modifier.scopeType.type) {
    case "notebookCell":
      return new NotebookCellStage(modifier);
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
    case "surroundingPair":
      return new SurroundingPairStage(modifier as SurroundingPairModifier);
    default:
      // Default to containing syntax scope using tree sitter
      return new ContainingSyntaxScopeStage(
        modifier as SimpleContainingScopeModifier | SimpleEveryScopeModifier,
      );
  }
}
