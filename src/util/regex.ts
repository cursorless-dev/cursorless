export function rightAnchored(regex: RegExp) {
  const { source, flags } = regex;

  return new RegExp(
    source.endsWith("$") ? source : source + "$",
    flags.replace("m", "")
  );
}

export function leftAnchored(regex: RegExp) {
  const { source, flags } = regex;

  return new RegExp(
    source.startsWith("^") ? source : "^" + source,
    flags.replace("m", "")
  );
}
