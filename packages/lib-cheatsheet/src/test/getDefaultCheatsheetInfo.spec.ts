import { getDefaultCheatsheetInfo } from "../lib/getDefaultCheatsheetInfo";

describe("getDefaultCheatsheetInfo", () => {
  const cheatsheetInfo = getDefaultCheatsheetInfo();

  test("constructs action syntax from the reference definition", () => {
    expect(getItem("actions", "swapTargets").variations).toEqual([
      {
        spokenForm: "swap with <target>",
        description: "Swap selection with <target>",
      },
      {
        spokenForm: "swap <target 1> with <target 2>",
        description: "Swap <target 1> with <target 2>",
      },
    ]);
  });

  test("omits private and disabled-by-default references", () => {
    expect(getSection("actions").items).not.toContainEqual(
      expect.objectContaining({ id: "private.showParseTree" }),
    );
    expect(getSection("scopes").items).not.toContainEqual(
      expect.objectContaining({ id: "sectionLevelOne" }),
    );
  });

  test("maps reference ids to the established cheatsheet ids", () => {
    expect(getItem("modifiers", "every")).toBeDefined();
    expect(getItem("scopes", "pair")).toBeDefined();
  });

  function getSection(sectionId: string) {
    return cheatsheetInfo.sections.find(({ id }) => id === sectionId)!;
  }

  function getItem(sectionId: string, itemId: string) {
    return getSection(sectionId).items.find(({ id }) => id === itemId)!;
  }
});
