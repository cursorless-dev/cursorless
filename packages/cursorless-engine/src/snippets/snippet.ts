import { SnippetDefinition } from "@cursorless/common";
import { Target } from "../typings/target.types";
import {
  Placeholder,
  Text,
  TextmateSnippet,
  Variable,
} from "./vendor/vscodeSnippet/snippetParser";
import { KnownSnippetVariableNames } from "./vendor/vscodeSnippet/snippetVariables";

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
  targets: Target[],
  definitions: SnippetDefinition[],
): SnippetDefinition {
  const definitionIndices = targets.map((target) =>
    findMatchingSnippetDefinitionForSingleTarget(target, definitions),
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

function findMatchingSnippetDefinitionForSingleTarget(
  target: Target,
  definitions: SnippetDefinition[],
): number {
  const languageId = target.editor.document.languageId;

  return definitions.findIndex(({ scope }) => {
    if (scope == null) {
      return true;
    }

    const { langIds, scopeTypes } = scope;

    if (langIds != null && !langIds.includes(languageId)) {
      return false;
    }

    if (scopeTypes != null) {
      // TODO: Implement this; see #802
      throw new Error("Scope types not yet implemented");
    }

    return true;
  });
}
