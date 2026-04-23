import type { Context } from "mocha";
import * as sinon from "sinon";
import type { IDE, NormalizedIDE } from "@cursorless/lib-common";
import { shouldUpdateFixtures, sleep, SpyIDE } from "@cursorless/lib-common";
import {
  getTestHelpers,
  resetReusableEditor,
} from "@cursorless/lib-vscode-common";

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

  let originalIde: NormalizedIDE;
  let injectIde: (ide: IDE) => void;
  let spyIde: SpyIDE | undefined;

  setup(async function endToEndTestSetupInner(this: Context) {
    const title = this.test!.fullTitle();
    retryCount = title === previousTestTitle ? retryCount + 1 : 0;
    previousTestTitle = title;
    const testHelpers = await getTestHelpers();
    originalIde = testHelpers.ide;
    injectIde = testHelpers.injectIde;
    testHelpers.commandServerApi.setFocusedElementType(undefined);
    spyIde = new SpyIDE(originalIde);
    injectIde(spyIde);
  });

  teardown(() => {
    sinon.restore();
    injectIde(originalIde);
  });

  suiteTeardown(() => {
    resetReusableEditor();
  });

  return {
    getSpy() {
      if (spyIde == null) {
        throw new Error("Spy is undefined");
      }
      return spyIde;
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
    : ms * 2 ** (retryCount - 2);

  return sleep(timeToSleep);
}
