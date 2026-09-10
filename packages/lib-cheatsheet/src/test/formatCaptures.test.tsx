import assert from "node:assert/strict";
import { suite, teardown, test } from "mocha";
import { render } from "preact";
import { act } from "preact/test-utils";
import { formatCaptures } from "../lib/utils/formatCaptures";

suite("formatCaptures", () => {
  teardown(() => {
    for (const container of document.body.children) {
      render(null, container);
    }
    document.body.innerHTML = "";
  });

  test("formats capture placeholders", async () => {
    const container = document.createElement("div");
    document.body.append(container);

    await act(() => {
      render(<div>{formatCaptures("hello <target> world")}</div>, container);
    });

    assert.equal(container.textContent, "hello [target] world");
    assert.notEqual(container.querySelector('a[href="#legend"]'), null);
  });

  test("leaves malformed captures as plain text", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const input = "<<=<=<=";

    await act(() => {
      render(<div>{formatCaptures(input)}</div>, container);
    });

    assert.equal(container.textContent, input);
    assert.equal(container.querySelector('a[href="#legend"]'), null);
  });
});
