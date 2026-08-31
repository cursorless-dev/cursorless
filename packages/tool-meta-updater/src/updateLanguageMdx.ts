import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import type { LanguageId } from "@cursorless/lib-common";
import { languageReferences } from "@cursorless/lib-common";
import {
  renderLanguageScopeVisualizer,
  scopeVisualizerImport,
} from "./renderScopeVisualizerMdx";
import type { ScopeFixtureGroup } from "./scopeFixtureGroups";

export function updateLanguageMdx(
  languageId: LanguageId,
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
    `# ${languageReferences[languageId].name}`,
    "",
    renderLanguageScopeVisualizer(languageId, scopeFixtureGroups),
    "",
  ];

  return expected.join("\n");
}
