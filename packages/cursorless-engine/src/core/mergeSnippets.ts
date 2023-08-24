import type { Snippet, SnippetMap } from "@cursorless/common";
import { cloneDeep, groupBy, mapValues, merge } from "lodash";
import { compareSnippetDefinitions } from "./compareSnippetDefinitions";

export function mergeSnippets(
  coreSnippets: SnippetMap,
  thirdPartySnippets: Record<string, SnippetMap>,
  userSnippets: SnippetMap[],
): SnippetMap {
  const mergedSnippets: SnippetMap = {};

  // We make a merged map where we map every key to an array of all snippets
  // with that key, whether they are core, third-party, or user snippets.
  const mergedMap = mapValues(
    groupBy(
      [
        ...prepareSnippetsFromOrigin(SnippetOrigin.core, coreSnippets),
        ...prepareSnippetsFromOrigin(
          SnippetOrigin.thirdParty,
          ...Object.values(thirdPartySnippets),
        ),
        ...prepareSnippetsFromOrigin(SnippetOrigin.user, ...userSnippets),
      ],
      ([key]) => key,
    ),
    (entries) => entries.map(([, value]) => value),
  );

  Object.entries(mergedMap).forEach(([key, snippets]) => {
    const mergedSnippet: Snippet = merge(
      {},
      // We sort the snippets by origin as (core, third-party, user) so that
      // when we merge them, the user snippets will override the third-party
      // snippets, which will override the core snippets.
      ...snippets
        .sort((a, b) => a.origin - b.origin)
        .map(({ snippet }) => snippet),
    );

    // We sort the definitions by decreasing precedence, so that earlier
    // definitions will be chosen before later definitions when we're choosing a
    // definition for a given target context.
    mergedSnippet.definitions = snippets
      .flatMap(({ origin, snippet }) =>
        snippet.definitions.map((definition) => ({ origin, definition })),
      )
      .sort((a, b) => -compareSnippetDefinitions(a, b))
      .map(({ definition }) => definition);

    mergedSnippets[key] = mergedSnippet;
  });

  return mergedSnippets;
}

/**
 * Prepares the given snippet maps for merging by adding the given origin to
 * each snippet.
 * @param origin The origin of the snippets
 * @param snippetMaps The snippet maps from the given origin
 * @returns An array of entries of the form [key, {origin, snippet}]
 */
function prepareSnippetsFromOrigin(
  origin: SnippetOrigin,
  ...snippetMaps: SnippetMap[]
) {
  return snippetMaps
    .map((snippetMap) =>
      mapValues(cloneDeep(snippetMap), (snippet) => ({
        origin,
        snippet,
      })),
    )
    .flatMap((snippetMap) => Object.entries(snippetMap));
}

export enum SnippetOrigin {
  core = 0,
  thirdParty = 1,
  user = 2,
}
