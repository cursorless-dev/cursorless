import { render } from "preact";
import { act } from "preact/test-utils";
import { Cheatsheet } from "../lib/Cheatsheet";
import { fakeCheatsheetInfo } from "../lib/utils/fakeCheatsheetInfo";

describe("Cheatsheet", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should render successfully", async () => {
    const container = document.createElement("div");
    document.body.append(container);

    await act(() => {
      render(<Cheatsheet cheatsheetInfo={fakeCheatsheetInfo} />, container);
    });

    expect(container).toBeTruthy();
  });
});
