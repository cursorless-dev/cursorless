import { sleepWithBackoff } from "../endToEndTestSetup";

type Predicate = () => boolean | Promise<boolean>;

/**
 * Waits for a predicate to become true, checking periodically with an
 * increasing delay between checks. Returns true if the predicate becomes true
 * within the given number of iterations, and false otherwise.
 */
export async function waitFor(
  predicate: Predicate,
  iterations = 20,
): Promise<boolean> {
  for (let i = 0; i < iterations; i++) {
    if (await Promise.resolve(predicate())) {
      return true;
    }

    await sleepWithBackoff(25);
  }

  return false;
}
