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

  const refComponentName = `${kind.charAt(0).toUpperCase() + kind.slice(1)}Reference`;
  const isScope = kind === "scope";

  const expected: string[] = [];

  if (entry.nameShort != null) {
    expected.push(`---`, `sidebar_label: ${entry.nameShort}`, `---`, "");
  }

  expected.push(
    `import { ${refComponentName} } from "../components/ReferenceEntry";`,
  );

  if (isScope) {
    expected.push(`import { Scopes } from "../components/Scopes";`);
  }

  expected.push(
    "",
    `# ${entry.name}`,
    "",
    `<${refComponentName} id="${id}" />`,
  );

  if (isScope) {
    expected.push(`<Scopes scopeTypeType="${id}" />`);
  }

  expected.push("");

  return expected.join("\n");
}
