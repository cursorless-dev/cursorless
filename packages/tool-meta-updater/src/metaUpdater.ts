// Copied and modified from
// https://github.com/pnpm/pnpm/tree/d583fbb2ad7e6b986d133a4eaf60824713f13c06/.meta-updater/src/index.ts
// License was
// https://github.com/pnpm/pnpm/blob/d583fbb2ad7e6b986d133a4eaf60824713f13c06/LICENSE

import { readWantedLockfile } from "@pnpm/lockfile-file";
import { createUpdateOptions } from "@pnpm/meta-updater";
import type { ScopeTypeType } from "@cursorless/lib-common";
import {
  actionReferenceGroups,
  actionReferences,
  getTutorialsForContext,
  graphemeDefaultSpokenForms,
  languageReferences,
  modifierReferenceGroups,
  modifierReferences,
  pairedDelimiterReferences,
  scopeReferenceGroups,
  scopeReferences,
  unsafeKeys,
} from "@cursorless/lib-common";
import type { RecordedTestPath } from "@cursorless/lib-node-common";
import {
  FileSystemTutorialContentProvider,
  getRecordedDocsPaths,
  getRecordedTestsDirPath,
  getScopeTestPaths,
} from "@cursorless/lib-node-common";
import type { Context } from "./Context";
import { updateRecordedTestFixtureData } from "./renderRecordedTestVisualizer";
import { createScopeFixtureGroups } from "./scopeFixtureGroups";
import { textFormat } from "./textFormat";
import { updateGraphemeDefaultSpokenFormsMd } from "./updateGraphemeDefaultSpokenFormsMd";
import { updateLanguageMdx, updateLanguagesReadmeMd } from "./updateLanguages";
import { updatePackageJson } from "./updatePackageJson";
import { updatePairedDelimitersMd } from "./updatePairedDelimitersMd";
import {
  updateReferenceMdx,
  updateReferenceReadmeMd,
} from "./updateReferences";
import { updateScopeFixtureData } from "./updateScopeFixtureData";
import { updateScopeSupportFacetInfos } from "./updateScopeSupportFacetInfos";
import { updateSpokenForms } from "./updateSpokenForms";
import { updateTSConfig } from "./updateTSConfig";
import { updateTSConfigBase } from "./updateTSConfigBase";
import {
  updateTutorialFixtureData,
  updateTutorialMdx,
  updateTutorialReadmeMdx,
} from "./updateTutorialMdx";
import { cleanId } from "./util/cleanId";

export const updater = async (workspaceDir: string) => {
  const pnpmLockfile = await readWantedLockfile(workspaceDir, {
    ignoreIncompatible: false,
  });

  if (pnpmLockfile == null) {
    throw new Error("no pnpm lockfile found");
  }

  const context: Context = {
    pnpmLockfile,
    workspaceDir,
  };

  // oxlint-disable-next-line node/no-process-env
  process.env.CURSORLESS_REPO_ROOT = workspaceDir;

  const userDir = "src/docs/user";
  const contributingDir = "src/docs/contributing";
  const scopeFixtureGroups = createScopeFixtureGroups(workspaceDir);
  const scopeTestPaths = getScopeTestPaths();
  const recordedDocsPaths = getRecordedDocsPaths();
  const languageIds = unsafeKeys(languageReferences);
  const tutorialContentProvider = new FileSystemTutorialContentProvider(
    getRecordedTestsDirPath(),
  );
  const tutorials = getTutorialsForContext("documentation");

  return createUpdateOptions({
    files: {
      "package.json": updatePackageJson.bind(null, context),
      "tsconfig.json": updateTSConfig.bind(null, context),
      "tsconfig.base.json": updateTSConfigBase.bind(null, context),
      "resources/fixtures/scope-support-facet-infos.md":
        updateScopeSupportFacetInfos,
      "cursorless-talon/src/spoken_forms.json": updateSpokenForms,
      [`${userDir}/paired-delimiters.md`]: updatePairedDelimitersMd.bind(
        null,
        pairedDelimiterReferences,
      ),
      [`${userDir}/alphabet-and-symbols.md`]:
        updateGraphemeDefaultSpokenFormsMd.bind(
          null,
          graphemeDefaultSpokenForms,
        ),

      [`${userDir}/tutorial/README.mdx`]: updateTutorialReadmeMdx.bind(
        null,
        tutorials,
      ),
      ...Object.fromEntries(
        tutorials.flatMap((tutorial, index) => {
          return [
            [
              `${userDir}/tutorial/${tutorial.id}.mdx`,
              updateTutorialMdx.bind(
                null,
                tutorial,
                tutorials[index + 1],
                tutorialContentProvider,
              ),
            ],
            [
              `${userDir}/tutorial/fixtures/${tutorial.id}.json`,
              updateTutorialFixtureData.bind(
                null,
                tutorial,
                tutorialContentProvider,
              ),
            ],
          ];
        }),
      ),

      [`${userDir}/languages/README.md`]: updateLanguagesReadmeMd.bind(
        null,
        languageIds,
      ),
      ...Object.fromEntries(
        languageIds.flatMap((languageId) => {
          const groups = scopeFixtureGroups.forLanguage(languageId);
          return [
            [
              `${userDir}/languages/${languageId}.mdx`,
              updateLanguageMdx.bind(null, languageId, groups),
            ],
            [
              `${userDir}/languages/fixtures/${languageId}.json`,
              updateScopeFixtureData.bind(null, scopeTestPaths, groups),
            ],
          ];
        }),
      ),

      [`${userDir}/actions/README.md`]: updateReferenceReadmeMd.bind(
        null,
        "Actions",
        actionReferences,
        actionReferenceGroups,
      ),
      ...Object.fromEntries(
        Object.entries(actionReferences)
          .filter(([_, entry]) => !isRefPrivate(entry))
          .flatMap(([id, entry]) => {
            const paths = filterRecordedDocsPaths(
              recordedDocsPaths,
              "actions",
              id,
            );
            const basename = cleanId(id);
            return [
              [
                `${userDir}/actions/${basename}.mdx`,
                updateReferenceMdx.bind(null, id, entry, paths, []),
              ],
              [
                `${userDir}/actions/fixtures/${basename}.json`,
                updateRecordedTestFixtureData.bind(null, paths),
              ],
            ];
          }),
      ),

      [`${userDir}/modifiers/README.md`]: updateReferenceReadmeMd.bind(
        null,
        "Modifiers",
        modifierReferences,
        modifierReferenceGroups,
      ),
      ...Object.fromEntries(
        Object.entries(modifierReferences)
          .filter(([_, entry]) => !isRefPrivate(entry))
          .flatMap(([id, entry]) => {
            const paths = filterRecordedDocsPaths(
              recordedDocsPaths,
              "modifiers",
              id,
            );
            const basename = cleanId(id);
            return [
              [
                `${userDir}/modifiers/${basename}.mdx`,
                updateReferenceMdx.bind(null, id, entry, paths, []),
              ],
              [
                `${userDir}/modifiers/fixtures/${basename}.json`,
                updateRecordedTestFixtureData.bind(null, paths),
              ],
            ];
          }),
      ),

      [`${userDir}/scopes/README.md`]: updateReferenceReadmeMd.bind(
        null,
        "Scopes",
        scopeReferences,
        scopeReferenceGroups,
      ),
      ...Object.fromEntries(
        Object.entries(scopeReferences)
          .filter(([_, entry]) => !isRefPrivate(entry))
          .flatMap(([id, entry]) => {
            const groups = scopeFixtureGroups.forScope(id as ScopeTypeType);
            const basename = cleanId(id);
            return [
              [
                `${userDir}/scopes/${basename}.mdx`,
                updateReferenceMdx.bind(null, id, entry, [], groups),
              ],
              [
                `${userDir}/scopes/fixtures/${basename}.json`,
                updateScopeFixtureData.bind(null, scopeTestPaths, groups),
              ],
            ];
          }),
      ),

      [`${contributingDir}/private-scopes/README.md`]:
        updateReferenceReadmeMd.bind(null, "Private scopes", scopeReferences, [
          {
            id: "private",
            name: "Private",
            description:
              "These scopes are not intended for public use and may change or be removed without notice.",
          },
        ]),
      ...Object.fromEntries(
        Object.entries(scopeReferences)
          .filter(([_, entry]) => isRefPrivate(entry))
          .flatMap(([id, entry]) => {
            const groups = scopeFixtureGroups.forScope(id as ScopeTypeType);
            const basename = cleanId(id);
            return [
              [
                `${contributingDir}/private-scopes/${basename}.mdx`,
                updateReferenceMdx.bind(null, id, entry, [], groups),
              ],
              [
                `${contributingDir}/private-scopes/fixtures/${basename}.json`,
                updateScopeFixtureData.bind(null, scopeTestPaths, groups),
              ],
            ];
          }),
      ),
    },

    formats: {
      md: textFormat,
      mdx: textFormat,
    },
  });
};

function filterRecordedDocsPaths(
  recordedDocsPaths: RecordedTestPath[],
  folder: "actions" | "modifiers",
  id: string,
): RecordedTestPath[] {
  return recordedDocsPaths.filter((path) =>
    new RegExp(`^docs/${folder}/${id}\\d*$`, "u").test(path.name),
  );
}

function isRefPrivate(entry: object): boolean {
  return "visibility" in entry && entry.visibility === "private";
}
