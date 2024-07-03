import type { FormatPluginFnOptions } from "@pnpm/meta-updater";

export function updateLanguageMdxConfig(
  languageId: string,
  actual: string | null,
  options: FormatPluginFnOptions,
): string | null {
  if (options.manifest.name !== "@cursorless/cursorless-org-docs") {
    return null;
  }

  if (actual != null) {
    return actual;
  }

  const expected = `
import Language from "./Language";

# ${languageId}

<Language languageId="${languageId}"></Language>
`.trimStart();

  return expected;
}
