import assert from "node:assert/strict";
import { parse } from "node-html-parser";
import type { CheatsheetInfo } from "@cursorless/lib-common";
import { injectCheatsheetInfo } from "../src/injectCheatsheetInfo";

suite("Cheatsheet", () => {
  test("injects cheatsheet info as executable script text", () => {
    const cheatsheetInfo: CheatsheetInfo = {
      sections: [
        {
          id: "actions",
          name: "Actions",
          items: [
            {
              id: "test-action",
              type: "action",
              variations: [
                {
                  spokenForm: "take <target>",
                  description: "Select A & B </script>",
                },
              ],
            },
          ],
        },
      ],
    };

    const output = injectCheatsheetInfo(
      '<html><script id="cheatsheet-data">old data</script></html>',
      cheatsheetInfo,
    );
    const script = parse(output).getElementById("cheatsheet-data")!;

    assert.equal(
      script.rawText,
      `document.cheatsheetInfo = ${JSON.stringify(cheatsheetInfo).replaceAll("<", String.raw`\u003c`)};`,
    );
    assert.doesNotMatch(script.rawText, /&(?:amp|lt|quot);/u);
  });
});
