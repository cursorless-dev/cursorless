import { getCursorlessApi } from "@cursorless/vscode-common";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite("Cursorless engine integration", async function () {
  endToEndTestSetup(this);

  test("integration", async () => {
    const cursorlessApi = await getCursorlessApi();
    const { runIntegrationTests } = cursorlessApi.testHelpers!;
    await runIntegrationTests();
  });
});
