// Copied and modified from
// https://github.com/pnpm/pnpm/tree/d583fbb2ad7e6b986d133a4eaf60824713f13c06/.meta-updater/src/index.ts
// License was
// https://github.com/pnpm/pnpm/blob/d583fbb2ad7e6b986d133a4eaf60824713f13c06/LICENSE

import { readWantedLockfile } from "@pnpm/lockfile-file";
import { createUpdateOptions } from "@pnpm/meta-updater";
import {
  actionReferences,
  languageScopeSupport,
  modifierReferences,
  scopeReferences,
} from "@cursorless/lib-common";
import type { Context } from "./Context";
import { textFormat } from "./textFormat";
import { updateLanguageMdx } from "./updateLanguageMdx";
import { updatePackageJson } from "./updatePackageJson";
import { updatePrivateScopeMdx } from "./updatePrivateScopeMdx";
import { updateReferenceMdx } from "./updateReferenceMdx";
import { updatesScopeSupportFacetInfos } from "./updatesScopeSupportFacetInfos";
import { updateTSConfig } from "./updateTSConfig";
import { updateTSConfigBase } from "./updateTSConfigBase";

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
  const referenceDir = `${userDir}/reference`;

  return createUpdateOptions({
    files: {
      "package.json": updatePackageJson.bind(null, context),
      "tsconfig.json": updateTSConfig.bind(null, context),
      "tsconfig.base.json": updateTSConfigBase.bind(null, context),
      "resources/fixtures/scopeSupportFacetInfos.md":
        updatesScopeSupportFacetInfos,
      ...Object.fromEntries(
        Object.keys(languageScopeSupport).map((languageId) => [
          `${userDir}/languages/${languageId}.mdx`,
          updateLanguageMdx.bind(null, languageId),
        ]),
      ),
      ...Object.fromEntries(
        Object.entries(actionReferences).map(([id, entry]) => [
          `${referenceDir}/actions/${cleanId(id)}.mdx`,
          updateReferenceMdx.bind(null, "action", id, entry),
        ]),
      ),
      ...Object.fromEntries(
        Object.entries(modifierReferences).map(([id, entry]) => [
          `${referenceDir}/modifiers/${cleanId(id)}.mdx`,
          updateReferenceMdx.bind(null, "modifier", id, entry),
        ]),
      ),
      ...Object.fromEntries(
        Object.entries(scopeReferences).map(([id, entry]) => [
          `${referenceDir}/scopes/${cleanId(id)}.mdx`,
          updateReferenceMdx.bind(null, "scope", id, entry),
        ]),
      ),
      ...Object.fromEntries(
        Object.entries(scopeReferences).map(([id, entry]) => [
          `${contributingDir}/privateScopes/${cleanId(id)}.mdx`,
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

function cleanId(id: string): string {
  return id.replace("private.", "").replace("experimental.", "");
}
