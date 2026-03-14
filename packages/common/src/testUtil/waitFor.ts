import sleep from "../util/sleep";

type Predicate = () => boolean | Promise<boolean>;

/**
 * Waits for a predicate to become true, checking every 25ms. Returns true if
 * the predicate becomes true within the given number of iterations, and false
 * otherwise.
 */
export async function waitFor(
  predicate: Predicate,
  iterations = 10,
): Promise<boolean> {
  for (let i = 0; i < iterations; i++) {
    if (await Promise.resolve(predicate())) {
      return true;
    }

    await sleep(25);
  }

  return false;
}
