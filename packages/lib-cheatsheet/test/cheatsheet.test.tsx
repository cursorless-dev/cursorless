import assert from "node:assert/strict";
import { render } from "preact";
import { act } from "preact/test-utils";
import { Cheatsheet } from "../src/lib/Cheatsheet";
import { fakeCheatsheetInfo } from "../src/lib/utils/fakeCheatsheetInfo";

suite("Cheatsheet", () => {
  teardown(() => {
    for (const container of document.body.children) {
      render(null, container);
    }
    document.body.innerHTML = "";
  });

  test("should render successfully", async () => {
    const container = document.createElement("div");
    document.body.append(container);

    await act(() => {
      render(<Cheatsheet cheatsheetInfo={fakeCheatsheetInfo} />, container);
    });

    assert.ok(container.childElementCount > 0);
  });
});
