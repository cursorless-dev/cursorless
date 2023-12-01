import {
  IterationScopeRanges,
  Range,
  ScopeRanges,
  TargetRanges,
} from "@cursorless/common";
import { serializeHeader } from "./serializeHeader";
import { serializeTargetRange } from "./serializeTargetRange";

export function serializeScopeFixture(
  code: string,
  scopes: ScopeRanges[],
): string {
  const codeLines = code.split("\n");

  const serializedScopes = scopes.map((scope, index) =>
    serializeScope(codeLines, scope, scopes.length > 1 ? index + 1 : undefined),
  );

  return serializeScopeFixtureHelper(codeLines, serializedScopes);
}

export function serializeIterationScopeFixture(
  code: string,
  scopes: IterationScopeRanges[],
): string {
  const codeLines = code.split("\n");

  const serializedScopes = scopes.map((scope, index) =>
    serializeIterationScope(
      codeLines,
      scope,
      scopes.length > 1 ? index + 1 : undefined,
    ),
  );

  return serializeScopeFixtureHelper(codeLines, serializedScopes);
}

function serializeScopeFixtureHelper(
  codeLines: string[],
  scopes: string[],
): string {
  const serializedScopes = scopes.join("\n\n");

  return [...codeLines, "---", serializedScopes, ""].join("\n");
}

function serializeScope(
  codeLines: string[],
  { domain, targets }: ScopeRanges,
  scopeNumber: number | undefined,
): string {
  if (targets.length === 1) {
    return serializeTarget({
      codeLines,
      target: targets[0],
      scopeNumber,
      targetNumber: undefined,
      domain,
    });
  }

  // If we have multiple targets or the domain is not equal to the content range: add domain last
  return [
    ...targets.map((target, index) =>
      serializeTarget({
        codeLines,
        target,
        scopeNumber,
        targetNumber: index + 1,
      }),
    ),
    "",
    serializeHeader({
      header: "Domain",
      scopeNumber,
      targetNumber: undefined,
      range: domain,
    }),
    serializeTargetRange(codeLines, domain),
  ].join("\n");
}

function serializeIterationScope(
  codeLines: string[],
  { domain, ranges }: IterationScopeRanges,
  scopeNumber: number | undefined,
): string {
  const lines: string[] = [""];

  const groupHeaders = !ranges.some(
    (range) => !domain.isRangeEqual(range.range),
  );

  ranges.forEach((range, index) => {
    if (!groupHeaders && index > 0) {
      lines.push("");
    }

    lines.push(
      serializeHeader({
        header: "Range",
        scopeNumber,
        targetNumber: ranges.length > 1 ? index + 1 : undefined,
        range: groupHeaders ? undefined : range.range,
      }),
    );

    if (!groupHeaders) {
      lines.push(serializeTargetRange(codeLines, range.range));
    }
  });

  if (!groupHeaders) {
    lines.push("");
  }

  lines.push(
    serializeHeader({
      header: "Domain",
      scopeNumber,
      targetNumber: undefined,
      range: domain,
    }),
    serializeTargetRange(codeLines, domain),
  );

  return lines.join("\n");
}

interface SerializeTargetArg {
  codeLines: string[];
  target: TargetRanges;
  scopeNumber: number | undefined;
  targetNumber: number | undefined;
  domain?: Range;
}

function serializeTarget({
  codeLines,
  target,
  scopeNumber,
  targetNumber,
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
        scopeNumber,
        targetNumber,
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
        scopeNumber,
        targetNumber,
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
        scopeNumber,
        targetNumber,
      }),
    );
  }

  if (target.trailingDelimiter != null) {
    lines.push(
      serializeTargetCompact({
        codeLines,
        target: target.trailingDelimiter,
        prefix: "Trailing delimiter",
        scopeNumber,
        targetNumber,
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
          scopeNumber,
          targetNumber,
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
          scopeNumber,
          targetNumber,
        }),
      ),
    );
  }

  if (domain != null && !target.contentRange.isRangeEqual(domain)) {
    lines.push(
      "",
      serializeHeader({
        header: "Domain",
        scopeNumber,
        targetNumber,
        range: domain,
      }),
      serializeTargetRange(codeLines, domain),
    );
  }

  lines.push(
    serializeTargetInsertionDelimiter(target, scopeNumber, targetNumber),
  );

  return lines.join("\n");
}

function serializeTargetInsertionDelimiter(
  target: TargetRanges,
  scopeNumber: number | undefined,
  targetNumber: number | undefined,
): string {
  const header = serializeHeader({
    header: "Insertion delimiter",
    scopeNumber,
    targetNumber,
  });

  return `\n${header} ${JSON.stringify(target.insertionDelimiter)}`;
}

interface SerializeTargetCompactArg {
  codeLines: string[];
  target: TargetRanges;
  prefix: string | undefined;
  scopeNumber: number | undefined;
  targetNumber: number | undefined;
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
  scopeNumber,
  targetNumber,
}: SerializeTargetCompactArg): string {
  const lines: string[] = [""];

  if (target.contentRange.isRangeEqual(target.removalRange)) {
    lines.push(
      serializeHeader({
        prefix,
        header: undefined,
        scopeNumber,
        targetNumber,
        range: target.contentRange,
      }),
      serializeTargetRange(codeLines, target.contentRange),
    );
  } else {
    lines.push(
      serializeHeader({
        prefix,
        header: "Content",
        scopeNumber,
        targetNumber,
        range: target.contentRange,
      }),
      serializeTargetRange(codeLines, target.contentRange),
      serializeHeader({
        prefix,
        header: "Removal",
        scopeNumber,
        targetNumber,
        range: target.removalRange,
      }),
      serializeTargetRange(codeLines, target.removalRange),
    );
  }

  return lines.join("\n");
}
