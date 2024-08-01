import { type IDE, SpyIDE } from "@cursorless/common";
import type { TalonJsTestHelpers } from "@cursorless/cursorless-everywhere-talon-core";
import type { Context } from "mocha";

interface EndToEndTestSetupOpts {
  retries?: number;
  timeout?: string | number;
}

export function endToEndTestSetup(
  suite: Mocha.Suite,
  testHelpers: TalonJsTestHelpers,
  { retries = 5, timeout = "100s" }: EndToEndTestSetupOpts = {},
) {
  suite.timeout(timeout);
  suite.retries(retries);

  let ide: IDE;
  let injectIde: (ide: IDE) => void;
  let spy: SpyIDE | undefined;

  setup(async function (this: Context) {
    ({ ide, injectIde } = testHelpers);
    testHelpers.commandServerApi.setFocusedElementType(undefined);
    spy = new SpyIDE(ide);
    injectIde(spy);
  });

  teardown(() => {
    injectIde(ide);
  });

  return {
    getSpy() {
      if (spy == null) {
        throw new Error("SpyIDE is undefined");
      }
      return spy;
    },
  };
}
