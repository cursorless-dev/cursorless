import { endToEndTestSetup } from "../../endToEndTestSetup";
import { asyncSafety } from "@cursorless/common";
import { runBasicScopeInfoTest } from "./runBasicScopeInfoTest";

suite("scope provider", async function () {
  endToEndTestSetup(this);

  test(
    "basic",
    asyncSafety(() => runBasicScopeInfoTest()),
  );
});
