import { NamedSnippetsDeprecationError } from "@cursorless/lib-common";
import type {
  CustomInsertSnippetArg,
  CustomWrapWithSnippetArg,
  InsertSnippetArg,
  WrapWithSnippetArg,
} from "@cursorless/lib-common";

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
    throw new NamedSnippetsDeprecationError();
  }
  if (snippetDescription.type === "custom") {
    return snippetDescription;
  }

  const preferredSnippet = tryToFindPreferredSnippet(
    snippetDescription.snippets,
    languageId,
    snippetDescription.fallbackLanguage,
  );

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

function tryToFindPreferredSnippet<
  T extends CustomInsertSnippetArg | CustomWrapWithSnippetArg,
>(
  snippetDescriptions: T[],
  languageId: string,
  fallbackLanguage: string | undefined,
): T | undefined {
  // First try to find snippet matching language id
  let snippet = findSnippetWithFewestLanguages(
    snippetDescriptions.filter((snippetDescription) => {
      return snippetDescription.languages?.includes(languageId);
    }),
  );

  // Secondly try to find snippet matching fallback language
  if (snippet == null && fallbackLanguage != null) {
    snippet = findSnippetWithFewestLanguages(
      snippetDescriptions.filter((snippetDescription) => {
        return snippetDescription.languages?.includes(fallbackLanguage);
      }),
    );
  }

  // Finally try to find global snippet
  if (snippet == null) {
    snippet = snippetDescriptions.find((snippetDescription) => {
      return snippetDescription.languages == null;
    });
  }

  return snippet;
}

function findSnippetWithFewestLanguages<
  T extends CustomInsertSnippetArg | CustomWrapWithSnippetArg,
>(snippets: T[]): T | undefined {
  if (snippets.length === 0) {
    return undefined;
  }

  // Find the snippet with the fewest languages
  let preferredSnippet = snippets[0];

  for (const snippet of snippets.slice(1)) {
    if (preferredSnippet.languages == null || snippet.languages == null) {
      throw new Error(
        "Snippet must have languages defined to find the one with the fewest languages",
      );
    }
    if (snippet.languages.length < preferredSnippet.languages.length) {
      preferredSnippet = snippet;
    }
  }

  return preferredSnippet;
}
