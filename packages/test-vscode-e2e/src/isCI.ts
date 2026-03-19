export function isCI() {
  return "CI" in process.env;
}
