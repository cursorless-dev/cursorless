import { SimpleScopeTypeType, SnippetDefinition } from "@cursorless/common";
import { Target } from "../typings/target.types";
import {
  Placeholder,
  Text,
  TextmateSnippet,
  Variable,
} from "./vendor/vscodeSnippet/snippetParser";
import { KnownSnippetVariableNames } from "./vendor/vscodeSnippet/snippetVariables";
import { ModifierStageFactory } from "../processTargets/ModifierStageFactory";

/**
 * Replaces the snippet variable with name `placeholderName` with
 * TM_SELECTED_TEXT
 *
 * Also replaces any unknown variables with placeholders. We do this so it's
 * easier to leave one of the placeholders blank. We may make it so that you can
 * disable this with a setting in the future
 * @param parsedSnippet The parsed textmate snippet to operate on
 * @param placeholderName The variable name to replace with TM_SELECTED_TEXT
 * @param substitutions A map from variable names to text values that will be
 * substituted and the given variable will no longer be a placeholder in the
 * final snippet
 */
export function transformSnippetVariables(
  parsedSnippet: TextmateSnippet,
  placeholderName?: string | null,
  substitutions?: Record<string, string>,
): void {
  let nextPlaceholderIndex = getMaxPlaceholderIndex(parsedSnippet) + 1;
  const placeholderIndexMap: Record<string, number> = {};

  parsedSnippet.walk((candidate) => {
    if (candidate instanceof Variable) {
      if (candidate.name === placeholderName) {
        candidate.name = "TM_SELECTED_TEXT";
      } else if (
        substitutions != null &&
        Object.prototype.hasOwnProperty.call(substitutions, candidate.name)
      ) {
        candidate.parent.replace(candidate, [
          new Text(substitutions[candidate.name]),
        ]);
      } else if (!KnownSnippetVariableNames[candidate.name]) {
        let placeholderIndex: number;
        if (candidate.name in placeholderIndexMap) {
          placeholderIndex = placeholderIndexMap[candidate.name];
        } else {
          placeholderIndex = nextPlaceholderIndex++;
          placeholderIndexMap[candidate.name] = placeholderIndex;
        }
        const placeholder = new Placeholder(placeholderIndex);
        candidate.children.forEach((child) => placeholder.appendChild(child));
        candidate.parent.replace(candidate, [placeholder]);
      }
    }

    if (candidate instanceof Placeholder) {
      if (candidate.index.toString() === placeholderName) {
        candidate.parent.replace(candidate, [new Variable("TM_SELECTED_TEXT")]);
      }
    }
    return true;
  });
}

/**
 * Returns the highest placeholder index in the given snippet
 * @param parsedSnippet The parsed textmate snippet
 * @returns The highest placeholder index in the given snippet
 */
function getMaxPlaceholderIndex(parsedSnippet: TextmateSnippet): number {
  let placeholderIndex = 0;
  parsedSnippet.walk((candidate) => {
    if (candidate instanceof Placeholder) {
      placeholderIndex = Math.max(placeholderIndex, candidate.index);
    }
    return true;
  });
  return placeholderIndex;
}

/**
 * Based on the context determined by  {@link targets} (eg the file's language
 * id and containing scope), finds the first snippet definition that matches the
 * given context. Throws an error if different snippet definitions match for
 * different targets or if matching snippet definition could not be found
 * @param targets The target that defines the context to use for finding the
 * right snippet definition
 * @param definitions The list of snippet definitions to search
 * @returns The snippet definition that matches the given context
 */
export function findMatchingSnippetDefinitionStrict(
  modifierStageFactory: ModifierStageFactory,
  targets: Target[],
  definitions: SnippetDefinition[],
): SnippetDefinition {
  const definitionIndices = targets.map((target) =>
    findMatchingSnippetDefinitionForSingleTarget(
      modifierStageFactory,
      target,
      definitions,
    ),
  );

  const definitionIndex = definitionIndices[0];

  if (!definitionIndices.every((index) => index === definitionIndex)) {
    throw new Error("Multiple snippet definitions match the given context");
  }

  if (definitionIndex === -1) {
    throw new Error("Couldn't find matching snippet definition");
  }

  return definitions[definitionIndex];
}

/**
 * Based on the context determined by {@link target} (eg the file's language id
 * and containing scope), finds the best snippet definition that matches the
 * given context. Returns -1 if no matching snippet definition could be found.
 *
 * We assume that the definitions are sorted in precedence order, so we just
 * return the first match we find.
 *
 * @param modifierStageFactory For creating containing scope modifiers
 * @param target The target to find a matching snippet definition for
 * @param definitions The list of snippet definitions to search
 * @returns The index of the best snippet definition that matches the given
 * target, or -1 if no matching snippet definition could be found
 */
function findMatchingSnippetDefinitionForSingleTarget(
  modifierStageFactory: ModifierStageFactory,
  target: Target,
  definitions: SnippetDefinition[],
): number {
  const languageId = target.editor.document.languageId;

  // We want to find the first definition that matches the given context.
  // Note that we just use the first match we find because the definitions are
  // guaranteed to come sorted in precedence order.
  return definitions.findIndex(({ scope }) => {
    if (scope == null) {
      return true;
    }

    const { langIds, scopeTypes, excludeDescendantScopeTypes } = scope;

    if (langIds != null && !langIds.includes(languageId)) {
      return false;
    }

    if (scopeTypes != null) {
      const allScopeTypes = scopeTypes.concat(
        excludeDescendantScopeTypes ?? [],
      );
      let matchingTarget: Target | undefined = undefined;
      let matchingScopeType: SimpleScopeTypeType | undefined = undefined;
      for (const scopeTypeType of allScopeTypes) {
        try {
          let containingTarget = modifierStageFactory
            .create({
              type: "containingScope",
              scopeType: { type: scopeTypeType },
            })
            .run(target)[0];

          if (target.contentRange.isRangeEqual(containingTarget.contentRange)) {
            // Skip this scope if the target is exactly the same as the
            // containing scope, otherwise wrapping won't work, because we're
            // really outside the containing scope when we're wrapping
            containingTarget = modifierStageFactory
              .create({
                type: "containingScope",
                scopeType: { type: scopeTypeType },
                ancestorIndex: 1,
              })
              .run(target)[0];
          }

          if (
            matchingTarget == null ||
            matchingTarget.contentRange.contains(containingTarget.contentRange)
          ) {
            matchingTarget = containingTarget;
            matchingScopeType = scopeTypeType;
          }
        } catch (e) {
          continue;
        }
      }

      return (
        matchingTarget != null &&
        !(excludeDescendantScopeTypes ?? []).includes(matchingScopeType!)
      );
    }

    return true;
  });
}
