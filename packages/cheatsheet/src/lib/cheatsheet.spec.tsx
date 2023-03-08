import { render } from "@testing-library/react";

import { CheatsheetPage } from "./cheatsheet";

describe("Cheatsheet", () => {
  it("should render successfully", () => {
    const { baseElement } = render(
      <CheatsheetPage
        cheatsheetInfo={{
          sections: [
            {
              name: "foo",
              id: "foo",
              items: [
                {
                  id: "bar",
                  type: "bar",
                  variations: [
                    { spokenForm: "Hello", description: "Some hello" },
                  ],
                },
              ],
            },
          ],
        }}
      />,
    );
    expect(baseElement).toBeTruthy();
  });
});
