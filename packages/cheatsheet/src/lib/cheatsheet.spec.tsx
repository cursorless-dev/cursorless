import { render } from "@testing-library/react";

import { CheatsheetPage } from "./cheatsheet";
import { fakeCheatsheetInfo } from "./fakeCheatsheetInfo";

describe("Cheatsheet", () => {
  it("should render successfully", () => {
    const { baseElement } = render(
      <CheatsheetPage cheatsheetInfo={fakeCheatsheetInfo} />,
    );
    expect(baseElement).toBeTruthy();
  });
});
