import getModifierStage from "../processTargets/getModifierStage";
import { SnippetDefinition } from "../typings/snippet";
import { Target } from "../typings/target.types";
import {
  Placeholder,
  Text,
  TextmateSnippet,
  Variable,
} from "../vendor/snippet/snippetParser";
import { KnownSnippetVariableNames } from "../vendor/snippet/snippetVariables";

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
  substitutions?: Record<string, string>
): void {
  let nextPlaceholderIndex = getMaxPlaceholderIndex(parsedSnippet) + 1;
  const placeholderIndexMap: Record<string, number> = {};

  parsedSnippet.walk((candidate) => {
    if (candidate instanceof Variable) {
      if (candidate.name === placeholderName) {
        candidate.name = "TM_SELECTED_TEXT";
      } else if (
        substitutions != null &&
        substitutions.hasOwnProperty(candidate.name)
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
  var placeholderIndex = 0;
  parsedSnippet.walk((candidate) => {
    if (candidate instanceof Placeholder) {
      placeholderIndex = Math.max(placeholderIndex, candidate.index);
    }
    return true;
  });
  return placeholderIndex;
}

/**
 * Based on the context determined by  {@link target} (eg the file's language id
 * and containing scope), finds the first snippet definition that matches the
 * given context.
 * @param target The target that defines the context to use for finding the
 * right snippet definition
 * @param definitions The list of snippet definitions to search
 * @returns The snippet definition that matches the given context
 */
export function findMatchingSnippetDefinition(
  target: Target,
  definitions: SnippetDefinition[]
): SnippetDefinition | undefined {
  const languageId = target.editor.document.languageId;

  return definitions.find(({ scope }) => {
    if (scope == null) {
      return true;
    }

    const { langIds, scopeType } = scope;

    if (langIds != null && !langIds.includes(languageId)) {
      return false;
    }

    if (scopeType != null) {
      // TODO: Implement scope types once we have #785
      throw new Error("Scope types not yet implemented");
    }

    return true;
  });
}
