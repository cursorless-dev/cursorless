import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import type { LanguageId } from "@cursorless/lib-common";
import { languageReferences } from "@cursorless/lib-common";
import {
  renderLanguageScopeVisualizer,
  scopeVisualizerImport,
} from "./renderScopeVisualizerMdx";
import type { ScopeFixtureGroup } from "./scopeFixtureGroups";
import { isAppWebDocs } from "./util/isManifest";

export function updateLanguagesReadmeMd(
  languageIds: LanguageId[],
  _actual: string | null,
  options: FormatPluginFnOptions,
): string | null {
  if (!isAppWebDocs(options)) {
    return null;
  }

  return [
    "---",
    "sidebar_position: 4",
    "---",
    "",
    "# Supported languages",
    "",
    ...languageIds.map((id) => {
      const name = languageReferences[id].name;
      return `- [${name}](./${id}.mdx)`;
    }),
    "",
  ].join("\n");
}

export function updateLanguageMdx(
  languageId: LanguageId,
  scopeFixtureGroups: ScopeFixtureGroup[],
  actual: string | null,
  options: FormatPluginFnOptions,
): string | null {
  if (!isAppWebDocs(options)) {
    return null;
  }

  const languageRef = languageReferences[languageId];
  const frontMatter =
    languageRef.shortName != null
      ? ["---", `sidebar_label: ${languageRef.shortName}`, "---", ""]
      : [];

  const expected = [
    ...frontMatter,
    scopeVisualizerImport,
    `import scopeTests from "./fixtures/${languageId}.json";`,
    "",
    `# ${languageRef.name}`,
    "",
    renderLanguageScopeVisualizer(languageId, scopeFixtureGroups),
    "",
  ];

  return expected.join("\n");
}
