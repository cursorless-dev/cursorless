const statementNameValue = [
  "statement.iteration",
  "name.iteration",
  "value.iteration",
];
const statementNameValueType = [...statementNameValue, "type.iteration"];
const statementNameValueDomain = statementNameValue.map(
  (name) => `${name}.domain`,
);
const statementNameValueTypeDomain = statementNameValueType.map(
  (name) => `${name}.domain`,
);
const statementNameValueStart = statementNameValue.map(
  (name) => `${name}.start.endOf`,
);
const statementNameValueEnd = statementNameValue.map(
  (name) => `${name}.end.startOf`,
);
const statementNameValueTypeStartExclusive = statementNameValueType.map(
  (name) => `${name}.start.endOf`,
);
const statementNameValueTypeEndExclusive = statementNameValueType.map(
  (name) => `${name}.end.startOf`,
);
const statementNameValueEndInclusive = statementNameValue.map(
  (name) => `${name}.end.endOf`,
);
const statementNameValueTypeEndInclusive = statementNameValueType.map(
  (name) => `${name}.end.endOf`,
);

/** Expand shared captures after Tree-sitter has matched the query. */
export function expandCaptureName(name: string): string[] {
  switch (name) {
    case "statementNameValue.iteration":
      return statementNameValue;
    case "statementNameValueType.iteration":
      return statementNameValueType;
    case "statementNameValue.iteration.domain":
      return statementNameValueDomain;
    case "statementNameValueType.iteration.domain":
      return statementNameValueTypeDomain;
    case "statementNameValue.iteration.start.endOf":
      return statementNameValueStart;
    case "statementNameValue.iteration.end.startOf":
      return statementNameValueEnd;
    case "statementNameValueType.iteration.start.endOf":
      return statementNameValueTypeStartExclusive;
    case "statementNameValueType.iteration.end.startOf":
      return statementNameValueTypeEndExclusive;
    case "statementNameValue.iteration.end.endOf":
      return statementNameValueEndInclusive;
    case "statementNameValueType.iteration.end.endOf":
      return statementNameValueTypeEndInclusive;
    default:
      return [name];
  }
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
