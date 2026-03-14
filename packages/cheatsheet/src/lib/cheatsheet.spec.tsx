import { render } from "preact";
import { act } from "preact/test-utils";
import { CheatsheetPage } from "./CheatsheetPage";
import { fakeCheatsheetInfo } from "./fakeCheatsheetInfo";

describe("Cheatsheet", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should render successfully", async () => {
    const container = document.createElement("div");
    document.body.append(container);

    await act(() => {
      render(<CheatsheetPage cheatsheetInfo={fakeCheatsheetInfo} />, container);
    });

    expect(container).toBeTruthy();
  });
});
