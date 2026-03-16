import { getProcessEnv } from "../util/getProcessEnv";

/**
 * Used to check weather the update fixtures launch config was used.
 * @returns `true` if developer used to the update fixtures launch config
 */
export function shouldUpdateFixtures() {
  return getProcessEnv().CURSORLESS_TEST_UPDATE_FIXTURES === "true";
}
