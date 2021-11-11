import { SnippetDefinition } from "../typings/snippet";
import { TypedSelection } from "../typings/Types";
import {
  Placeholder,
  Text,
  TextmateSnippet,
  Variable,
} from "../vendor/snippet/snippetParser";
import { KnownSnippetVariableNames } from "../vendor/snippet/snippetVariables";

/**
 * Replaces the snippet variable with name `placeholderName` with TM_SELECTED_TEXT
 *
 * Also replaces any unknown variables with placeholders. We do this so it's
 * easier to leave one of the placeholders blank. We may make it so that you
 * can disable this with a setting in the future
 * @param parsedSnippet The parsed textmate snippet to operate on
 * @param placeholderName The variable name to replace with TM_SELECTED_TEXT
 */
export function transformSnippetVariables(
  parsedSnippet: TextmateSnippet,
  placeholderName?: string | null,
  substitutions?: Record<string, string>
) {
  var placeholderIndex = getMaxPlaceholderIndex(parsedSnippet) + 1;

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
        const placeholder = new Placeholder(placeholderIndex++);
        candidate.children.forEach((child) => placeholder.appendChild(child));
        candidate.parent.replace(candidate, [placeholder]);
      }
    }
    return true;
  });
}

export function getMaxPlaceholderIndex(parsedSnippet: TextmateSnippet) {
  var placeholderIndex = 0;
  parsedSnippet.walk((candidate) => {
    if (candidate instanceof Placeholder) {
      placeholderIndex = Math.max(placeholderIndex, candidate.index);
    }
    return true;
  });
  return placeholderIndex;
}

export function parseSnippetLocation(
  snippetLocation: string
): [string, string] {
  const [snippetName, placeholderName] = snippetLocation.split(".");
  if (snippetName == null || placeholderName == null) {
    throw new Error("Snippet location missing '.'");
  }
  return [snippetName, placeholderName];
}

export function findMatchingSnippetDefinition(
  typedSelection: TypedSelection,
  definitions: SnippetDefinition[]
) {
  const languageId = typedSelection.selection.editor.document.languageId;

  return definitions.find(({ scope }) => {
    if (scope == null) {
      return true;
    }

    const { langIds, scopeType } = scope;

    if (langIds != null && !langIds.includes(languageId)) {
      return false;
    }

    if (scopeType != null) {
      // TODO: Implement scope types by refactoring code out of processScopeType
      throw new Error("Scope types not yet implemented");
    }

    return true;
  });
}
