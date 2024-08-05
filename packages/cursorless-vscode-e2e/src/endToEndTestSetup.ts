import type { IDE } from "@cursorless/common";
import { shouldUpdateFixtures, sleep, SpyIDE } from "@cursorless/common";
import { getCursorlessApi } from "@cursorless/vscode-common";
import type { Context } from "mocha";
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

interface EndToEndTestSetupOpts {
  retries?: number;
  timeout?: string | number;
}

export function endToEndTestSetup(
  suite: Mocha.Suite,
  { retries = 5, timeout = "100s" }: EndToEndTestSetupOpts = {},
) {
  suite.timeout(timeout);
  suite.retries(retries);

  let ide: IDE;
  let injectIde: (ide: IDE) => void;
  let spy: SpyIDE | undefined;

  setup(async function (this: Context) {
    const title = this.test!.fullTitle();
    retryCount = title === previousTestTitle ? retryCount + 1 : 0;
    previousTestTitle = title;
    const testHelpers = (await getCursorlessApi()).testHelpers!;
    ({ ide, injectIde } = testHelpers);
    testHelpers.commandServerApi.setFocusedElementType(undefined);
    spy = new SpyIDE(ide);
    injectIde(spy);
  });

  teardown(() => {
    sinon.restore();
    injectIde(ide);
  });

  return {
    getSpy() {
      if (spy == null) {
        throw Error("spy is undefined");
      }
      return spy;
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
