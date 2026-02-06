import { asyncSafety } from "@cursorless/common";
import { isLinux } from "@cursorless/node-common";
import { endToEndTestSetup } from "../../endToEndTestSetup";
import { isCI } from "../../isCI";
import { runBasicScopeInfoTest } from "./runBasicScopeInfoTest";
import { runCustomRegexScopeInfoTest } from "./runCustomRegexScopeInfoTest";
import { runCustomSpokenFormScopeInfoTest } from "./runCustomSpokenFormScopeInfoTest";
import { runSurroundingPairScopeInfoTest } from "./runSurroundingPairScopeInfoTest";

suite("scope provider", async function () {
  endToEndTestSetup(this);

  test(
    "basic",
    asyncSafety(() => runBasicScopeInfoTest()),
  );
  test(
    "surrounding pair",
    asyncSafety(() => runSurroundingPairScopeInfoTest()),
  );
  test(
    "custom spoken form",
    asyncSafety(() => {
      // FIXME: This test is flaky on Linux CI, so we skip it there for now
      if (isCI() && isLinux()) {
        this.ctx.skip();
      }

      return runCustomSpokenFormScopeInfoTest();
    }),
  );
  test(
    "custom regex",
    asyncSafety(() => {
      // FIXME: This test is flaky on Linux CI, so we skip it there for now
      if (isCI() && isLinux()) {
        this.ctx.skip();
      }

      return runCustomRegexScopeInfoTest();
    }),
  );
});
