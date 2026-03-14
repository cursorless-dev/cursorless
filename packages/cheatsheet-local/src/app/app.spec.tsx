import { render } from "preact";
import { act } from "preact/test-utils";
import { App } from "./app";

describe("App", () => {
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

    expect(container.textContent).toMatch(/Welcome cheatsheet-local/gi);
  });
});
