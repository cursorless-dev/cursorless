// Copied and modified from
// https://github.com/pnpm/pnpm/tree/d583fbb2ad7e6b986d133a4eaf60824713f13c06/.meta-updater/src/index.ts
// License was
// https://github.com/pnpm/pnpm/blob/d583fbb2ad7e6b986d133a4eaf60824713f13c06/LICENSE
import { languageScopeSupport } from "@cursorless/common";
import { readWantedLockfile } from "@pnpm/lockfile-file";
import { createUpdateOptions } from "@pnpm/meta-updater";
import type { Context } from "./Context";
import { textFormat } from "./textFormat";
import { updateLanguageMdx } from "./updateLanguageMdx";
import { updatePackageJson } from "./updatePackageJson";
import { getScopeTypeTypes, updateScopeMdx } from "./updateScopeMdx";
import { updateTSConfig } from "./updateTSConfig";
import { updatesScopeSupportFacetInfos } from "./updatesScopeSupportFacetInfos";

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

  return createUpdateOptions({
    files: {
      ["package.json"]: updatePackageJson.bind(null, context),
      ["tsconfig.json"]: updateTSConfig.bind(null, context),
      ["data/scopeSupportFacetInfos.md"]: updatesScopeSupportFacetInfos,
      ...Object.fromEntries(
        Object.keys(languageScopeSupport).map((languageId) => [
          `src/docs/user/languages/${languageId}.mdx`,
          updateLanguageMdx.bind(null, languageId),
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
