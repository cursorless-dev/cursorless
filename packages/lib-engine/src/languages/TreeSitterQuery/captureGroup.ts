/** Expand shared captures after Tree-sitter has matched the query. */
export function expandCaptureName(name: string): string[] {
  if (!captureNameIsGroup(name)) {
    return [name];
  }

  const dotIndex = name.indexOf(".");
  const group = dotIndex === -1 ? name.slice(2) : name.slice(2, dotIndex);
  const suffix = dotIndex === -1 ? "" : name.slice(dotIndex);
  return group.split("_").map((member) => `${member}${suffix}`);
}

/** Preserve predicate changes while giving each expanded capture its own name. */
export function expandCaptures<T extends { name: string }>(
  captures: readonly T[],
  aliases: ReadonlyMap<string, readonly string[]>,
): readonly T[] {
  let result: T[] | undefined;

  for (let i = 0; i < captures.length; i++) {
    const capture = captures[i];
    const names = aliases.get(capture.name);

    if (names == null) {
      result?.push(capture);
    } else {
      result ??= captures.slice(0, i);
      for (const name of names) {
        result.push({ ...capture, name });
      }
    }
  }

  return result ?? captures;
}

export function captureNameIsGroup(name: string): boolean {
  return name.startsWith("G_");
}
