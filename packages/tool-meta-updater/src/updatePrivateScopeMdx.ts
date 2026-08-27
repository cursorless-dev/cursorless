import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import type { ReferenceEntry } from "@cursorless/lib-common";

export function updatePrivateScopeMdx(
  id: string,
  entry: ReferenceEntry,
  actual: string | null,
  options: FormatPluginFnOptions,
): string | null {
  if (options.manifest.name !== "@cursorless/app-web-docs" || !entry.private) {
    return null;
  }

  const expected = `
import { Scopes } from "@site/src/docs/components/Scopes";

# ${entry.name}

<Scopes scopeTypeType="${id}" />
`.trimStart();

  return expected;
}
