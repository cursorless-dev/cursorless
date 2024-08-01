// Copied and modified from
// https://github.com/pnpm/pnpm/tree/d583fbb2ad7e6b986d133a4eaf60824713f13c06/.meta-updater/src/index.ts
// License was
// https://github.com/pnpm/pnpm/blob/d583fbb2ad7e6b986d133a4eaf60824713f13c06/LICENSE
import { languageScopeSupport } from "@cursorless/common";
import { readWantedLockfile } from "@pnpm/lockfile-file";
import { createUpdateOptions } from "@pnpm/meta-updater";
import { Context } from "./Context";
import { textFormat } from "./textFormat";
import { updateLanguageMdxConfig } from "./updateLanguageScopeSupportConfig";
import { updatePackageJson } from "./updatePackageJson";
import { updateTSConfig } from "./updateTSConfig";

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
      ...Object.fromEntries(
        Object.keys(languageScopeSupport).map((languageId) => {
          return [
            `src/docs/user/languages/${languageId}.mdx`,
            updateLanguageMdxConfig.bind(null, languageId),
          ];
        }),
      ),
    },
    formats: {
      mdx: textFormat,
    },
  });
};
