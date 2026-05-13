import { render } from "preact";
import { act } from "preact/test-utils";
import { fakeCheatsheetInfo } from "@cursorless/lib-cheatsheet";
import { App } from "../app";

describe("App", () => {
  beforeEach(() => {
    document.cheatsheetInfo = fakeCheatsheetInfo;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should render successfully", async () => {
    const container = document.createElement("div");
    document.body.append(container);

    await act(() => {
      render(<App />, container);
    });

    expect(container).toBeTruthy();
  });

  it("should have a greeting as the title", async () => {
    const container = document.createElement("div");
    document.body.append(container);

    await act(() => {
      render(<App />, container);
    });

    expect(container.textContent).toMatch(/Cursorless Cheatsheet/giu);
  });
});
