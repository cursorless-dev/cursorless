import { Range, ScopeRanges, TargetRanges } from "@cursorless/common";

export function serializeScopes(code: string, scopes: ScopeRanges[]): string {
  const codeLines = code.split(/\r?\n/g);

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
  scope: ScopeRanges,
  scopeIndex: number | undefined,
): string {
  if (scope.targets.length === 1) {
    return serializeTarget(
      codeLines,
      scope.targets[0],
      scopeIndex,
      undefined,
      scope.domain,
    );
  }

  // If we have multiple targets or the domain is not equal to the content range: add domain last
  return [
    ...scope.targets.map((target, index) =>
      serializeTarget(
        codeLines,
        target,
        scopeIndex,
        scope.targets.length > 1 ? index + 1 : undefined,
      ),
    ),
    "",
    serializeHeader(undefined, "Domain", scopeIndex, undefined, scope.domain),
    serializeCodeRange(codeLines, scope.domain),
  ].join("\n");
}

function serializeTarget(
  codeLines: string[],
  target: TargetRanges,
  scopeIndex: number | undefined,
  targetIndex: number | undefined,
  domain?: Range,
): string {
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
      serializeHeader(
        undefined,
        header,
        scopeIndex,
        targetIndex,
        index === headers.length - 1 ? target.contentRange : undefined,
      ),
    ),
  );

  lines.push(serializeCodeRange(codeLines, target.contentRange));

  // Add separate removal header below content if their ranges are not equal
  if (!target.contentRange.isRangeEqual(target.removalRange)) {
    lines.push(
      "",
      serializeHeader(
        undefined,
        "Removal",
        scopeIndex,
        targetIndex,
        target.removalRange,
      ),
      serializeCodeRange(codeLines, target.removalRange),
    );
  }

  if (target.leadingDelimiter != null) {
    lines.push(
      serializeTargetBasics(
        codeLines,
        target.leadingDelimiter,
        "Leading delimiter",
        scopeIndex,
        targetIndex,
      ),
    );
  }

  if (target.trailingDelimiter != null) {
    lines.push(
      serializeTargetBasics(
        codeLines,
        target.trailingDelimiter,
        "Trailing delimiter",
        scopeIndex,
        targetIndex,
      ),
    );
  }

  if (target.interior != null) {
    lines.push(
      ...target.interior.map((interior) =>
        serializeTargetBasics(
          codeLines,
          interior,
          "Interior",
          scopeIndex,
          targetIndex,
        ),
      ),
    );
  }

  if (target.boundary != null) {
    lines.push(
      ...target.boundary.map((interior) =>
        serializeTargetBasics(
          codeLines,
          interior,
          "Boundary",
          scopeIndex,
          targetIndex,
        ),
      ),
    );
  }

  if (domain != null && !target.contentRange.isRangeEqual(domain)) {
    lines.push(
      "",
      serializeHeader(undefined, "Domain", scopeIndex, targetIndex, domain),
      serializeCodeRange(codeLines, domain),
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
  const header = serializeHeader(
    undefined,
    "Insertion delimiter",
    scopeIndex,
    targetIndex,
  );
  const delimiter = target.insertionDelimiter
    .replaceAll("\r\n", "\\r\\n")
    .replaceAll("\n", "\\n");
  return `\n${header} "${delimiter}"`;
}

function serializeTargetBasics(
  codeLines: string[],
  target: TargetRanges,
  prefix: string | undefined,
  scopeIndex: number | undefined,
  targetIndex: number | undefined,
): string {
  const lines: string[] = [""];

  if (target.contentRange.isRangeEqual(target.removalRange)) {
    lines.push(
      serializeHeader(
        prefix,
        undefined,
        scopeIndex,
        targetIndex,
        target.contentRange,
      ),
    );
    lines.push(serializeCodeRange(codeLines, target.contentRange));
  } else {
    lines.push(
      serializeHeader(
        prefix,
        "Content",
        scopeIndex,
        targetIndex,
        target.contentRange,
      ),
      serializeCodeRange(codeLines, target.contentRange),
      serializeHeader(
        prefix,
        "Removal",
        scopeIndex,
        targetIndex,
        target.removalRange,
      ),
      serializeCodeRange(codeLines, target.removalRange),
    );
  }

  return lines.join("\n");
}

function serializeHeader(
  prefix: string | undefined,
  header: string | undefined,
  scopeIndex: number | undefined,
  targetIndex: number | undefined,
  range?: Range,
): string {
  const parts: string[] = [];
  if (scopeIndex != null) {
    parts.push(`#${scopeIndex}`);
  }
  if (prefix != null) {
    if (header != null) {
      parts.push(prefix + ":");
    } else {
      parts.push(prefix);
    }
  }
  if (header != null) {
    parts.push(header);
  }
  if (targetIndex != null) {
    parts.push(targetIndex.toString());
  }
  const suffix = range != null ? ` ${range.toString()}` : "";
  return `[${parts.join(" ")}] =${suffix}`;
}

function serializeCodeRange(codeLines: string[], range: Range): string {
  const { start, end } = range;
  const lines: string[] = [];

  codeLines.forEach((codeLine, lineNumber) => {
    lines.push(
      codeLine.length > 0 ? `${lineNumber}| ${codeLine}` : `${lineNumber}|`,
    );

    if (lineNumber === start.line) {
      const prefix = fill(" ", start.character + 2) + ">";
      if (start.line === end.line) {
        lines.push(prefix + fill("-", end.character - start.character) + "<");
      } else {
        lines.push(prefix + fill("-", codeLine.length - start.character));
      }
    } else if (lineNumber > start.line && lineNumber < end.line) {
      if (codeLine.length > 0) {
        lines.push("   " + fill("-", codeLine.length));
      } else {
        lines.push("");
      }
    } else if (lineNumber === end.line) {
      lines.push("   " + fill("-", end.character) + "<");
    } else {
      lines.push("");
    }
  });

  return lines.join("\n");
}

function fill(character: string, count: number): string {
  return new Array(count + 1).join(character);
}
