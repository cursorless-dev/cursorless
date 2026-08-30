// Copied and modified from
// https://github.com/pnpm/pnpm/tree/d583fbb2ad7e6b986d133a4eaf60824713f13c06/.meta-updater/src/index.ts
// License was
// https://github.com/pnpm/pnpm/blob/d583fbb2ad7e6b986d133a4eaf60824713f13c06/LICENSE

import { readWantedLockfile } from "@pnpm/lockfile-file";
import { createUpdateOptions } from "@pnpm/meta-updater";
import {
  actionReferenceGroups,
  actionReferences,
  languageScopeSupport,
  modifierReferenceGroups,
  modifierReferences,
  pairedDelimiterReferences,
  scopeReferenceGroups,
  scopeReferences,
} from "@cursorless/lib-common";
import type { Context } from "./Context";
import { textFormat } from "./textFormat";
import { updateLanguageMdx } from "./updateLanguageMdx";
import { updatePackageJson } from "./updatePackageJson";
import { updatePairedDelimitersMd } from "./updatePairedDelimitersMd";
import { updatePrivateScopeMdx } from "./updatePrivateScopeMdx";
import { updateReferenceMdx } from "./updateReferenceMdx";
import { updateReferenceReadmeMd } from "./updateReferenceReadmeMd";
import { updateScopeSupportFacetInfos } from "./updateScopeSupportFacetInfos";
import { updateTSConfig } from "./updateTSConfig";
import { updateTSConfigBase } from "./updateTSConfigBase";
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

  const userDir = "src/docs/user";
  const contributingDir = "src/docs/contributing";

  return createUpdateOptions({
    files: {
      "package.json": updatePackageJson.bind(null, context),
      "tsconfig.json": updateTSConfig.bind(null, context),
      "tsconfig.base.json": updateTSConfigBase.bind(null, context),
      "resources/fixtures/scope-support-facet-infos.md":
        updateScopeSupportFacetInfos,
      ...Object.fromEntries(
        Object.keys(languageScopeSupport).map((languageId) => [
          `${userDir}/languages/${languageId}.mdx`,
          updateLanguageMdx.bind(null, languageId),
        ]),
      ),
      [`${userDir}/paired-delimiters.md`]: updatePairedDelimitersMd.bind(
        null,
        pairedDelimiterReferences,
      ),
      [`${userDir}/actions/README.md`]: updateReferenceReadmeMd.bind(
        null,
        "Actions",
        actionReferences,
        actionReferenceGroups,
      ),
      [`${userDir}/modifiers/README.md`]: updateReferenceReadmeMd.bind(
        null,
        "Modifiers",
        modifierReferences,
        modifierReferenceGroups,
      ),
      [`${userDir}/scopes/README.md`]: updateReferenceReadmeMd.bind(
        null,
        "Scopes",
        scopeReferences,
        scopeReferenceGroups,
      ),
      ...Object.fromEntries(
        Object.entries(actionReferences).map(([id, entry]) => [
          `${userDir}/actions/${cleanId(id)}.mdx`,
          updateReferenceMdx.bind(null, "action", id, entry),
        ]),
      ),
      ...Object.fromEntries(
        Object.entries(modifierReferences).map(([id, entry]) => [
          `${userDir}/modifiers/${cleanId(id)}.mdx`,
          updateReferenceMdx.bind(null, "modifier", id, entry),
        ]),
      ),
      ...Object.fromEntries(
        Object.entries(scopeReferences).map(([id, entry]) => [
          `${userDir}/scopes/${cleanId(id)}.mdx`,
          updateReferenceMdx.bind(null, "scope", id, entry),
        ]),
      ),
      ...Object.fromEntries(
        Object.entries(scopeReferences).map(([id, entry]) => [
          `${contributingDir}/private-scopes/${cleanId(id)}.mdx`,
          updatePrivateScopeMdx.bind(null, id, entry),
        ]),
      ),
    },
    formats: {
      md: textFormat,
      mdx: textFormat,
    },
  });
};
