import { Position, Range, ScopeRanges, TargetRanges } from "@cursorless/common";

export function serializeScopes(code: string, scopes: ScopeRanges[]): string {
  const codeLines = code.split("\n");
  return [
    ...codeLines,
    "---",
    ...scopes.map((scope, index) =>
      serializeScope(
        codeLines,
        scope,
        scopes.length > 1 ? index + 1 : undefined,
      ),
    ),
    "",
  ].join("\n");
}

function serializeScope(
  codeLines: string[],
  scope: ScopeRanges,
  scopeIndex: number | undefined,
): string {
  if (
    scope.targets.length === 1 &&
    scope.targets[0].contentRange.isRangeEqual(scope.domain)
  ) {
    return serializeTarget(
      codeLines,
      scope.targets[0],
      undefined,
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
        undefined,
        scopeIndex,
        scope.targets.length > 1 ? index + 1 : undefined,
      ),
    ),
    "",
    serializeHeader(undefined, "Domain", scopeIndex, undefined),
    serializeCodeRange(codeLines, scope.domain),
  ].join("\n");
}

function serializeTarget(
  codeLines: string[],
  target: TargetRanges,
  prefix: string | undefined,
  scopeIndex: number | undefined,
  targetIndex: number | undefined,
  domain?: Range,
): string {
  const lines: string[] = [
    serializeTargetBasics(
      codeLines,
      target,
      prefix,
      scopeIndex,
      targetIndex,
      domain,
    ),
  ];

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

  return lines.join("\n");
}

function serializeTargetBasics(
  codeLines: string[],
  target: TargetRanges,
  prefix: string | undefined,
  scopeIndex: number | undefined,
  targetIndex: number | undefined,
  domain?: Range,
): string {
  const lines: string[] = [];

  lines.push("", serializeHeader(prefix, "Content", scopeIndex, targetIndex));

  // Add removal and domain headers below content header if their ranges are equal
  if (target.contentRange.isRangeEqual(target.removalRange)) {
    lines.push(serializeHeader(prefix, "Removal", scopeIndex, targetIndex));
  }
  if (domain != null && target.contentRange.isRangeEqual(domain)) {
    lines.push(serializeHeader(prefix, "Domain", scopeIndex, targetIndex));
  }

  lines.push(serializeCodeRange(codeLines, target.contentRange));

  // Add separate removal header below content if their ranges are not equal
  if (!target.contentRange.isRangeEqual(target.removalRange)) {
    lines.push(
      "",
      serializeHeader(prefix, "Removal", scopeIndex, targetIndex),
      serializeCodeRange(codeLines, target.removalRange),
    );
  }

  return lines.join("\n");
}

function serializeHeader(
  prefix: string | undefined,
  header: string,
  scopeIndex: number | undefined,
  targetIndex: number | undefined,
): string {
  const parts: string[] = [];
  if (scopeIndex != null) {
    parts.push(`#${scopeIndex}`);
  }
  if (prefix != null) {
    parts.push(prefix + ":");
  }
  parts.push(header);
  if (targetIndex != null) {
    parts.push(targetIndex.toString());
  }
  return `[${parts.join(" ")}]`;
}

function serializeCodeRange(codeLines: string[], range: Range): string {
  const { start, end } = range;
  const lines: string[] = [];

  codeLines.forEach((codeLine, index) => {
    const suffix = codeLine.length === 0 || codeLine.endsWith(" ") ? "◂" : "";
    const fullCodeLine = ` ${codeLine}${suffix}`;

    if (index === start.line) {
      if (range.isSingleLine) {
        lines.push(fullCodeLine);
        lines.push(serializeRange(start, end));
      } else {
        lines.push(serializeStartRange(start, codeLine.length));
        lines.push(fullCodeLine);
      }
    } else if (index === end.line) {
      lines.push(fullCodeLine);
      lines.push(serializeEndRange(end));
    } else {
      lines.push(fullCodeLine);
    }
  });

  return lines.join("\n");
}

function serializeRange(start: Position, end: Position): string {
  if (start.isEqual(end)) {
    return [new Array(start.character + 1).join(" "), "{}"].join("");
  }
  return [
    new Array(start.character + 2).join(" "),
    new Array(end.character - start.character + 1).join("^"),
  ].join("");
}

function serializeStartRange(start: Position, rowLength: number): string {
  return [
    new Array(start.character + 1).join(" "),
    "[",
    new Array(rowLength - start.character + 1).join("-"),
  ].join("");
}

function serializeEndRange(end: Position): string {
  return [" ", new Array(end.character + 1).join("-"), "]"].join("");
}
