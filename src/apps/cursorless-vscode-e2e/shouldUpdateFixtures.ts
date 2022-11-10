/**
 * Used to check weather the update fixtures launch config was used.
 * @returns `true` if developer used to the update fixtures launch config
 */
export default function shouldUpdateFixtures() {
  return process.env.CURSORLESS_TEST_UPDATE_FIXTURES === "true";
}
