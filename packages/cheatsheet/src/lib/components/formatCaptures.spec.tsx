import { render } from "preact";
import { act } from "preact/test-utils";
import { formatCaptures } from "./formatCaptures";

describe("formatCaptures", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("formats capture placeholders", async () => {
    const container = document.createElement("div");
    document.body.append(container);

    await act(() => {
      render(<div>{formatCaptures("hello <target> world")}</div>, container);
    });

    expect(container.textContent).toBe("hello [target] world");
    expect(container.querySelector('a[href="#legend"]')).not.toBeNull();
  });

  it("leaves malformed captures as plain text", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const input = "<<=<=<=";

    await act(() => {
      render(<div>{formatCaptures(input)}</div>, container);
    });

    expect(container.textContent).toBe(input);
    expect(container.querySelector('a[href="#legend"]')).toBeNull();
  });
});
