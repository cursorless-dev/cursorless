import { prettifyLanguageName } from "@cursorless/common";
import type { FormatPluginFnOptions } from "@pnpm/meta-updater";

export function updateLanguageMdx(
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
import { Language } from "./components/Language";

# ${prettifyLanguageName(languageId)}

<Language languageId="${languageId}" />
`.trimStart();

  return expected;
}
