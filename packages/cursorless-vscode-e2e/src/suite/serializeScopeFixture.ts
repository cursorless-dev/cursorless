import { Range, ScopeRanges, TargetRanges } from "@cursorless/common";
import { serializeTargetRange } from "./serializeTargetRange";
import { serializeHeader } from "./serializeHeader";

export function serializeScopeFixture(
  code: string,
  scopes: ScopeRanges[],
): string {
  const codeLines = code.split("\n");

  const serializedScopes = scopes
    .map((scope, index) =>
      serializeScope(
        codeLines,
        scope,
        scopes.length > 1 ? index + 1 : undefined,
      ),
    )
    .join("\n\n");

  return [...codeLines, "---", serializedScopes, ""].join("\n");
}

function serializeScope(
  codeLines: string[],
  { domain, targets }: ScopeRanges,
  scopeIndex: number | undefined,
): string {
  if (targets.length === 1) {
    return serializeTarget({
      codeLines,
      target: targets[0],
      scopeIndex,
      targetIndex: undefined,
      domain,
    });
  }

  // If we have multiple targets or the domain is not equal to the content range: add domain last
  return [
    ...targets.map((target, index) =>
      serializeTarget({
        codeLines,
        target,
        scopeIndex,
        targetIndex: index + 1,
      }),
    ),
    "",
    serializeHeader({
      header: "Domain",
      scopeIndex,
      targetIndex: undefined,
      range: domain,
    }),
    serializeTargetRange(codeLines, domain),
  ].join("\n");
}

interface SerializeTargetArg {
  codeLines: string[];
  target: TargetRanges;
  scopeIndex: number | undefined;
  targetIndex: number | undefined;
  domain?: Range;
}

function serializeTarget({
  codeLines,
  target,
  scopeIndex,
  targetIndex,
  domain,
}: SerializeTargetArg): string {
  const lines: string[] = [""];

  const headers = ["Content"];

  // Add removal and domain headers below content header if their ranges are equal
  if (target.contentRange.isRangeEqual(target.removalRange)) {
    headers.push("Removal");
  }
  if (domain != null && target.contentRange.isRangeEqual(domain)) {
    headers.push("Domain");
  }

  lines.push(
    ...headers.map((header, index) =>
      serializeHeader({
        header,
        scopeIndex,
        targetIndex,
        range: index === headers.length - 1 ? target.contentRange : undefined,
      }),
    ),
    serializeTargetRange(codeLines, target.contentRange),
  );

  // Add separate removal header below content if their ranges are not equal
  if (!target.contentRange.isRangeEqual(target.removalRange)) {
    lines.push(
      "",
      serializeHeader({
        header: "Removal",
        scopeIndex,
        targetIndex,
        range: target.removalRange,
      }),
      serializeTargetRange(codeLines, target.removalRange),
    );
  }

  if (target.leadingDelimiter != null) {
    lines.push(
      serializeTargetCompact({
        codeLines,
        target: target.leadingDelimiter,
        prefix: "Leading delimiter",
        scopeIndex,
        targetIndex,
      }),
    );
  }

  if (target.trailingDelimiter != null) {
    lines.push(
      serializeTargetCompact({
        codeLines,
        target: target.trailingDelimiter,
        prefix: "Trailing delimiter",
        scopeIndex,
        targetIndex,
      }),
    );
  }

  if (target.interior != null) {
    lines.push(
      ...target.interior.map((interior) =>
        serializeTargetCompact({
          codeLines,
          target: interior,
          prefix: "Interior",
          scopeIndex,
          targetIndex,
        }),
      ),
    );
  }

  if (target.boundary != null) {
    lines.push(
      ...target.boundary.map((interior) =>
        serializeTargetCompact({
          codeLines,
          target: interior,
          prefix: "Boundary",
          scopeIndex,
          targetIndex,
        }),
      ),
    );
  }

  if (domain != null && !target.contentRange.isRangeEqual(domain)) {
    lines.push(
      "",
      serializeHeader({
        header: "Domain",
        scopeIndex,
        targetIndex,
        range: domain,
      }),
      serializeTargetRange(codeLines, domain),
    );
  }

  lines.push(
    serializeTargetInsertionDelimiter(target, scopeIndex, targetIndex),
  );

  return lines.join("\n");
}

function serializeTargetInsertionDelimiter(
  target: TargetRanges,
  scopeIndex: number | undefined,
  targetIndex: number | undefined,
): string {
  const header = serializeHeader({
    header: "Insertion delimiter",
    scopeIndex,
    targetIndex,
  });

  return `\n${header} ${JSON.stringify(target.insertionDelimiter)}`;
}

interface SerializeTargetCompactArg {
  codeLines: string[];
  target: TargetRanges;
  prefix: string | undefined;
  scopeIndex: number | undefined;
  targetIndex: number | undefined;
}

/**
 * Given a target, serialize it compactly, including only the content and
 * removal ranges. We use this for auxiliary targets like delimiters and
 * interior/boundary targets of a target that we're serializing.
 * @param arg Configuration object
 * @returns A string representing the target
 */
function serializeTargetCompact({
  codeLines,
  target,
  prefix,
  scopeIndex,
  targetIndex,
}: SerializeTargetCompactArg): string {
  const lines: string[] = [""];

  if (target.contentRange.isRangeEqual(target.removalRange)) {
    lines.push(
      serializeHeader({
        prefix,
        header: undefined,
        scopeIndex,
        targetIndex,
        range: target.contentRange,
      }),
      serializeTargetRange(codeLines, target.contentRange),
    );
  } else {
    lines.push(
      serializeHeader({
        prefix,
        header: "Content",
        scopeIndex,
        targetIndex,
        range: target.contentRange,
      }),
      serializeTargetRange(codeLines, target.contentRange),
      serializeHeader({
        prefix,
        header: "Removal",
        scopeIndex,
        targetIndex,
        range: target.removalRange,
      }),
      serializeTargetRange(codeLines, target.removalRange),
    );
  }

  return lines.join("\n");
}
