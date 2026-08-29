export function formatVariables(pattern: string): string {
  return pattern
    .split(/(<[\w ]+>)/gu)
    .map((part) => {
      if (part.startsWith("<") && part.endsWith(">")) {
        return `\`${part}\``;
      }
      return part;
    })
    .join("");
}
