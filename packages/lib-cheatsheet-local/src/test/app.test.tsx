import assert from "node:assert/strict";
import { setup, suite, teardown, test } from "mocha";
import { render } from "preact";
import { act } from "preact/test-utils";
import { fakeCheatsheetInfo } from "@cursorless/lib-cheatsheet";
import { App } from "../app";

suite("App", () => {
  setup(() => {
    document.cheatsheetInfo = fakeCheatsheetInfo;
  });

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
      render(<App />, container);
    });

    assert.ok(container.childElementCount > 0);
  });

  test("should have a greeting as the title", async () => {
    const container = document.createElement("div");
    document.body.append(container);

    await act(() => {
      render(<App />, container);
    });

    assert.match(container.textContent, /Cursorless Cheatsheet/giu);
  });
});
