import { asyncSafety } from "@cursorless/common";
import { endToEndTestSetup } from "../../endToEndTestSetup";
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
    asyncSafety(() => runCustomSpokenFormScopeInfoTest()),
  );
  test(
    "custom regex",
    asyncSafety(() => runCustomRegexScopeInfoTest()),
  );
});
