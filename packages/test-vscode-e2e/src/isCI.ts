export function isCI() {
  // oxlint-disable-next-line node/no-process-env
  return "CI" in process.env;
}
