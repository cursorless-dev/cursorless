import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import type { ReferenceEntry } from "@cursorless/lib-common";

export function updateReferenceMdx(
  kind: "action" | "modifier" | "scope",
  id: string,
  entry: ReferenceEntry,
  actual: string | null,
  options: FormatPluginFnOptions,
): string | null {
  if (options.manifest.name !== "@cursorless/app-web-docs" || entry.private) {
    return null;
  }

  const importName = `${kind.charAt(0).toUpperCase() + kind.slice(1)}Reference`;

  const expected = `
import { ${importName} } from "../components/ReferenceEntry";

# ${entry.name}

<${importName} id="${id}" />
`.trimStart();

  return expected;
}
