import type {
  CustomInsertSnippetArg,
  CustomWrapWithSnippetArg,
  InsertSnippetArg,
  WrapWithSnippetArg,
} from "@cursorless/common";
import { compareSnippetDefinitions } from "./compareSnippetDefinitions";

export function getPreferredSnippet(
  snippetDescription: InsertSnippetArg,
  languageId: string,
): CustomInsertSnippetArg;

export function getPreferredSnippet(
  snippetDescription: WrapWithSnippetArg,
  languageId: string,
): CustomWrapWithSnippetArg;

export function getPreferredSnippet(
  snippetDescription: InsertSnippetArg | WrapWithSnippetArg,
  languageId: string,
) {
  if (snippetDescription.type === "named") {
    throw new Error(
      "Cursorless snippets are deprecated. Please use community snippets. Update to latest cursorless-talon and say 'cursorless migrate snippets'.",
    );
  }
  if (snippetDescription.type === "custom") {
    return snippetDescription;
  }

  const filteredSnippets = filterSnippetDefinitions(
    snippetDescription.snippets,
    languageId,
    snippetDescription.fallbackLanguage,
  );
  filteredSnippets.sort(compareSnippetDefinitions);
  const preferredSnippet = filteredSnippets[0];

  if (preferredSnippet == null) {
    const languages = getUniqueLanguagesString(snippetDescription.snippets);
    throw new Error(
      `No snippet available for language '${languageId}'. Available languages: ${languages}`,
    );
  }

  return preferredSnippet;
}

function getUniqueLanguagesString(snippets: CustomInsertSnippetArg[]): string {
  const languages = new Set(
    snippets.flatMap((snippet) => snippet.languages ?? []),
  );
  return Array.from(languages).sort().join(", ");
}

/**
 * Filter snippet definitions by language.
 * @param snippetDescriptions The snippets to filter
 * @returns The snippets that are relevant to the current language
 */
function filterSnippetDefinitions<
  T extends CustomInsertSnippetArg | CustomWrapWithSnippetArg,
>(
  snippetDescriptions: T[],
  languageId: string,
  fallbackLanguage: string | undefined,
): T[] {
  // First try to find snippet matching language id
  let snippets = snippetDescriptions.filter((snippetDescription) => {
    return snippetDescription.languages?.includes(languageId);
  });

  // Secondly try to find snippet matching fallback language
  if (snippets.length === 0 && fallbackLanguage != null) {
    snippets = snippetDescriptions.filter((snippetDescription) => {
      return snippetDescription.languages?.includes(fallbackLanguage);
    });
  }

  // Finally use global snippets
  if (snippets.length === 0) {
    snippets = snippetDescriptions.filter((snippetDescription) => {
      return snippetDescription.languages == null;
    });
  }

  return snippets;
}
