import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import { prettifyLanguageName } from "@cursorless/lib-common";
import {
  renderLanguageScopeVisualizer,
  scopeVisualizerImport,
} from "./renderScopeVisualizerMdx";
import type { ScopeFixtureGroup } from "./scopeFixtureGroups";

export function updateLanguageMdx(
  languageId: string,
  scopeFixtureGroups: ScopeFixtureGroup[],
  actual: string | null,
  options: FormatPluginFnOptions,
): string | null {
  if (options.manifest.name !== "@cursorless/app-web-docs") {
    return null;
  }

  const expected = [
    scopeVisualizerImport,
    "",
    `# ${prettifyLanguageName(languageId)}`,
    "",
    renderLanguageScopeVisualizer(languageId, scopeFixtureGroups),
    "",
  ];

  return expected.join("\n");
}
