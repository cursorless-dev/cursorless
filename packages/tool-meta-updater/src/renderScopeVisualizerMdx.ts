import { prettifyLanguageName } from "@cursorless/lib-common";
import type {
  ScopeFixtureFacet,
  ScopeFixtureGroup,
} from "./scopeFixtureGroups";

export const scopeVisualizerImport = `import { ScopeVisualizer, ScopeVisualizerOptions, ScopeVisualizerProvider } from "@site/src/docs/components/ScopeVisualizer";`;

export function renderLanguageScopeVisualizer(
  languageId: string,
  groups: ScopeFixtureGroup[],
): string {
  const publicScopes = groups.filter((scope) => !scope.private);
  const internalScopes = groups.filter((scope) => scope.private);
  const lines = [
    "<ScopeVisualizerProvider>",
    "",
    "Below are visualizations of all our scope tests for this language. These were created primarily for testing purposes rather than as documentation. There are quite a few, and they may feel a bit overwhelming from a documentation standpoint.",
    "",
    "## Scopes",
    "",
    "<ScopeVisualizerOptions />",
    "",
  ];

  renderScopeGroups(lines, publicScopes, {
    languageId,
    showScopeHeading: true,
  });

  if (internalScopes.length > 0) {
    lines.push(
      "## Internal scopes",
      "",
      "The following are internal scopes. They are not intended for user interaction or spoken use. These scopes exist solely for internal Cursorless functionality.",
      "",
    );
    renderScopeGroups(lines, internalScopes, {
      languageId,
      showScopeHeading: true,
    });
  }

  lines.push("</ScopeVisualizerProvider>");
  return lines.join("\n");
}

export function renderScopeVisualizer(
  groups: ScopeFixtureGroup[],
): string | undefined {
  const scope = groups[0];
  if (scope == null) {
    return undefined;
  }
  if (groups.length > 1) {
    throw new Error("Expected fixtures for exactly one scope");
  }

  const lines = [
    "<ScopeVisualizerProvider>",
    "",
    scope.private ? "## Internal scopes" : "## Scopes",
    "",
  ];
  if (scope.private) {
    lines.push(
      "The following are internal scopes. They are not intended for user interaction or spoken use. These scopes exist solely for internal Cursorless functionality.",
      "",
    );
  }
  lines.push("<ScopeVisualizerOptions />", "");
  renderFacets(lines, scope.facets, {});
  lines.push("</ScopeVisualizerProvider>");

  return lines.join("\n");
}

function renderScopeGroups(
  lines: string[],
  groups: ScopeFixtureGroup[],
  options: RenderOptions,
) {
  for (const scope of groups) {
    if (options.showScopeHeading) {
      lines.push(`### ${scope.name}`, "");
    }
    renderFacets(lines, scope.facets, options);
  }
}

interface RenderOptions {
  languageId?: string;
  showScopeHeading?: boolean;
}

function renderFacets(
  lines: string[],
  facets: ScopeFixtureFacet[],
  options: RenderOptions,
) {
  for (const [index, facet] of facets.entries()) {
    const headingLevel = options.showScopeHeading ? "####" : "###";
    const heading = options.showScopeHeading
      ? `${index + 1}. ${facet.name}`
      : facet.name;
    lines.push(
      `${headingLevel} ${heading}`,
      "",
      `<i>${facet.description}</i>`,
      "",
    );

    let previousLanguageId: string | undefined;
    for (const fixture of facet.fixtures) {
      if (
        options.languageId == null &&
        fixture.languageId !== previousLanguageId
      ) {
        previousLanguageId = fixture.languageId;
        lines.push(`##### ${prettifyLanguageName(fixture.languageId)}`, "");
      }

      const languageProp =
        options.languageId == null ? "" : ` languageId="${options.languageId}"`;
      lines.push(
        `<ScopeVisualizer fixtureName="${fixture.name}"${languageProp} />`,
        "",
      );
    }
  }
}
