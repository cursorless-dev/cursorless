import { asyncSafety } from "@cursorless/lib-common";
import { getCursorlessApi } from "@cursorless/lib-vscode-common";
import { commands } from "vscode";
import { endToEndTestSetup } from "../../endToEndTestSetup";
import { runBasicMultilineContentTest } from "./runBasicMultilineContentTest";
import { runBasicRemovalTest } from "./runBasicRemovalTest";
import { runNestedMultilineContentTest } from "./runNestedMultilineContentTest";
import { runUpdateTest } from "./runUpdateTest";

suite("scope visualizer", function () {
  endToEndTestSetup(this);

  suiteSetup(async () => {
    const { ide } = (await getCursorlessApi()).testHelpers!;
    ide.configuration.mockConfiguration("decorationDebounceDelayMs", 0);
  });

  teardown(() => commands.executeCommand("cursorless.hideScopeVisualizer"));

  test(
    "basic multiline content",
    asyncSafety(() => runBasicMultilineContentTest()),
  );
  test(
    "nested multiline content",
    asyncSafety(() => runNestedMultilineContentTest()),
  );
  test(
    "update",
    asyncSafety(() => runUpdateTest()),
  );
  test(
    "basic removal",
    asyncSafety(() => runBasicRemovalTest()),
  );
});
