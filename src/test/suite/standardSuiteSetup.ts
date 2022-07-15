import { Context } from "mocha";
import * as sinon from "sinon";
import sleep from "../../util/sleep";

/**
 * The number of times the current test has been retried. Will be 0 the first
 * time the test runs and increase by 1 each time the test fails and needs to be
 * rerun.
 */
let retryCount = -1;

/**
 * The title of the previously run test. Used to keep track of
 * {@link retryCount}.
 */
let previousTestTitle = "";

export function standardSuiteSetup(suite: Mocha.Suite) {
  suite.timeout("100s");
  suite.retries(5);

  teardown(() => {
    sinon.restore();
  });

  setup(async function (this: Context) {
    const title = this.test!.fullTitle();
    retryCount = title === previousTestTitle ? retryCount + 1 : 0;
    previousTestTitle = title;
  });
}

/**
 * Sleep function for use in tests that will be retried. Doubles the amount of
 * time it sleeps each time a test is run, starting from {@link ms} / 4.
 * @param ms The baseline number of milliseconds to sleep.
 * @returns A promise that will resolve when the sleep is over
 */

export function sleepWithBackoff(ms: number) {
  console.log(`Sleeping; runNumber = ${retryCount}`);
  return sleep(ms * Math.pow(2, retryCount - 2));
}
