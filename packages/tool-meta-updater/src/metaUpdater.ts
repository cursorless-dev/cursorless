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
import { updateReferenceMdx } from "./updateReferenceMdx";
import { getScopeTypeTypes, updateScopeMdx } from "./updateScopeMdx";
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

  const referenceDir = "src/docs/user/reference";

  return createUpdateOptions({
    files: {
      "package.json": updatePackageJson.bind(null, context),
      "tsconfig.json": updateTSConfig.bind(null, context),
      "tsconfig.base.json": updateTSConfigBase.bind(null, context),
      "resources/fixtures/scopeSupportFacetInfos.md":
        updatesScopeSupportFacetInfos,
      ...Object.fromEntries(
        Object.keys(languageScopeSupport).map((languageId) => [
          `src/docs/user/languages/${languageId}.mdx`,
          updateLanguageMdx.bind(null, languageId),
        ]),
      ),
      ...Object.fromEntries(
        Object.entries(actionReferences).map(([id, entry]) => [
          `${referenceDir}/actions/${id}.mdx`,
          updateReferenceMdx.bind(null, "action", id, entry),
        ]),
      ),
      ...Object.fromEntries(
        Object.entries(modifierReferences).map(([id, entry]) => [
          `${referenceDir}/modifiers/${id}.mdx`,
          updateReferenceMdx.bind(null, "modifier", id, entry),
        ]),
      ),
      ...Object.fromEntries(
        Object.entries(scopeReferences).map(([id, entry]) => [
          `${referenceDir}/scopes/${id}.mdx`,
          updateReferenceMdx.bind(null, "scope", id, entry.name),
        ]),
      ),
      ...Object.fromEntries(
        getScopeTypeTypes().map(({ scopeTypeType, name }) => [
          `src/docs/contributing/scopes/${scopeTypeType.replace("private.", "")}.mdx`,
          updateScopeMdx.bind(null, scopeTypeType, name),
        ]),
      ),
    },
    formats: {
      md: textFormat,
      mdx: textFormat,
    },
  });
};
