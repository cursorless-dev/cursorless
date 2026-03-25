import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import type { ScopeTypeType } from "@cursorless/lib-common";
import {
  plaintextScopeSupportFacetInfos,
  prettifyScopeType,
  scopeSupportFacetInfos,
  serializeScopeType,
} from "@cursorless/lib-common";

export function updateScopeMdx(
  scopeTypeType: ScopeTypeType,
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

  const expected = `
import { Scopes } from "./components/Scopes";

# ${name}

<Scopes scopeTypeType="${scopeTypeType}" />
`.trimStart();

  return expected;
}

export function getScopeTypeTypes() {
  const scopeTypes = Object.values(scopeSupportFacetInfos)
    .map((info) => info.scopeType)
    .concat(
      Object.values(plaintextScopeSupportFacetInfos).map(
        (info) => info.scopeType,
      ),
    );

  const result: { scopeTypeType: ScopeTypeType; name: string }[] = [];
  const used = new Set<ScopeTypeType>();

  for (const scopeType of scopeTypes) {
    const scopeTypeType = serializeScopeType(scopeType);
    if (used.has(scopeTypeType)) {
      continue;
    }
    used.add(scopeTypeType);
    result.push({ scopeTypeType, name: prettifyScopeType(scopeType) });
  }

  return result;
}
