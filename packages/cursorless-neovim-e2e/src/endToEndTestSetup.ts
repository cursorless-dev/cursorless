import { IDE, shouldUpdateFixtures, sleep, SpyIDE } from "@cursorless/common";
import { getCursorlessApi, NeovimIDE } from "@cursorless/neovim-common";
import { Context } from "mocha";
import * as sinon from "sinon";

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

export function endToEndTestSetup(suite: Mocha.Suite) {
  // XXX - disable that for now to avoid it to hang for 10 minutes on CI
  // suite.timeout("100s");
  // suite.retries(5);
  suite.timeout("10s");
  suite.retries(0);
  // suite.timeout("500s");
  // suite.retries(0);

  let ide: IDE;
  let injectIde: (ide: IDE) => void;
  let spy: SpyIDE | undefined;
  let neovimIDE: NeovimIDE;

  setup(async function (this: Context) {
    const title = this.test!.fullTitle();
    retryCount = title === previousTestTitle ? retryCount + 1 : 0;
    previousTestTitle = title;
    ({ ide, injectIde, neovimIDE } = (await getCursorlessApi()).testHelpers!);
    spy = new SpyIDE(ide);
    injectIde(spy);
  });

  teardown(() => {
    sinon.restore();
    injectIde(ide);
  });

  return {
    getSpy() {
      return spy;
    },
    getNeovimIDE() {
      return neovimIDE;
    },
  };
}

/**
 * Sleep function for use in tests that will be retried. Doubles the amount of
 * time it sleeps each time a test is run, starting from {@link ms} / 4.
 *
 * If the developer used the update fixtures launch config, we sleep for {@link ms} *
 * 2 every time so that they don't get spurious updates to fixtures due to not
 * sleeping enough.
 * @param ms The baseline number of milliseconds to sleep.
 * @returns A promise that will resolve when the sleep is over
 */
export function sleepWithBackoff(ms: number) {
  const timeToSleep = shouldUpdateFixtures()
    ? ms * 2
    : ms * Math.pow(2, retryCount - 2);

  return sleep(timeToSleep);
}
