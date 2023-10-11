import { asyncSafety } from "@cursorless/common";
import { endToEndTestSetup } from "../../endToEndTestSetup";
import { runBasicScopeInfoTest } from "./runBasicScopeInfoTest";
import { runCustomRegexScopeInfoTest } from "./runCustomRegexScopeInfoTest";

suite("scope provider", async function () {
  endToEndTestSetup(this);

  test(
    "basic",
    asyncSafety(() => runBasicScopeInfoTest()),
  );
  test(
    "custom regex",
    asyncSafety(() => runCustomRegexScopeInfoTest()),
  );
});
