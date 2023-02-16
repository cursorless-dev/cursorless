import { FakeIDE, SpyIDE } from "@cursorless/common";
import type { Context } from "mocha";
import * as sinon from "sinon";
import { injectIde } from "../singletons/ide.singleton";

export function unitTestSetup(setupFake?: (fake: FakeIDE) => void) {
  let spy: SpyIDE | undefined;
  let fake: FakeIDE | undefined;

  setup(async function (this: Context) {
    fake = new FakeIDE();
    setupFake?.(fake);
    spy = new SpyIDE(fake);
    injectIde(spy);
  });

  teardown(() => {
    sinon.restore();
    injectIde(undefined);
  });

  return {
    getSpy() {
      return spy;
    },
  };
}
