export function camelCaseToAllDown(input: string): string {
  return input
    .replace(/([A-Z])/g, " $1")
    .split(" ")
    .map((word) => word.toLowerCase())
    .join(" ");
}
