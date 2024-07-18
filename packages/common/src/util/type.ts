export function isString(arg: unknown): arg is string {
  return typeof arg === "string" || arg instanceof String;
}
