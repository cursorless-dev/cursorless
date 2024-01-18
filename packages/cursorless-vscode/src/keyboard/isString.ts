export function isString(input: any): input is string {
  return typeof input === "string" || input instanceof String;
}
