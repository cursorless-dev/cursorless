import type { FormatPluginFnOptions } from "@pnpm/meta-updater";

export function updateReferenceMdx(
  kind: "action" | "modifier" | "scope",
  id: string,
  name: string,
  actual: string | null,
  options: FormatPluginFnOptions,
): string | null {
  if (options.manifest.name !== "@cursorless/app-web-docs") {
    return null;
  }

  if (actual != null) {
    return actual;
  }

  const importName = `${kind.charAt(0).toUpperCase() + kind.slice(1)}Reference`;

  const expected = `
import { ${importName} } from "../components/ReferenceEntry";

# ${name}

<${importName} id="${id}" />
`.trimStart();

  return expected;
}
