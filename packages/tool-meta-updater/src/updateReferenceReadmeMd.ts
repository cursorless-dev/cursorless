import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import type { ReferenceEntry, ReferenceGroup } from "@cursorless/lib-common";
import { cleanId } from "./util/cleanId";
import { DISABLED_BY_DEFAULT } from "./util/constants";
import { formatVariables } from "./util/formatVariables";
import { injectSpokenForm } from "./util/injectSpokenForm";

export function updateReferenceReadmeMd(
  title: string,
  entries: Record<string, ReferenceEntry<string>>,
  groups: ReferenceGroup<string>[],
  actual: string | null,
  options: FormatPluginFnOptions,
): string | null {
  if (options.manifest.name !== "@cursorless/app-web-docs") {
    return null;
  }

  const expected: string[] = [`# ${title}`, ""];

  for (const group of groups) {
    if (group.id === "private") {
      continue;
    }

    expected.push(`## ${group.name}`, "");

    const groupEntries = Object.entries(entries)
      .filter(([, entry]) => entry.group.id === group.id)
      .toSorted(([, a], [, b]) => a.group.index - b.group.index);

    for (const [rawId, entry] of groupEntries) {
      const id = cleanId(rawId);
      const disabledByDefault =
        entry.visibility === "disabledByDefault"
          ? ` (${DISABLED_BY_DEFAULT})`
          : "";
      for (const syntax of entry.syntaxes) {
        const pattern = injectSpokenForm(
          syntax.pattern,
          entry.defaultSpokenForm,
        );
        const description = formatVariables(syntax.description);
        expected.push(
          `- [\`"${pattern}"\`](./${id}.mdx) - ${description}${disabledByDefault}`,
        );
      }
    }

    expected.push("");
  }

  return expected.join("\n");
}
