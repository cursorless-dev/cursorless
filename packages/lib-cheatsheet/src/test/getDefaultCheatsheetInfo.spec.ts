import {
  applyLegacyCheatsheetInfo,
  getCheatsheetInfo,
  getDefaultCheatsheetInfo,
} from "@cursorless/lib-common/cheatsheet";
import type { CheatsheetInfo } from "@cursorless/lib-common/cheatsheet";

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

  test("applies raw Talon list entries to the current syntax", () => {
    const customCheatsheetInfo = getCheatsheetInfo({
      listEntries: [
        {
          listName: "simple_action",
          id: "editNewLineBefore",
          spokenForms: ["gulp"],
        },
        {
          listName: "interior_modifier",
          id: "interiorOnly",
          spokenForms: ["within"],
        },
        { listName: "scope_type", id: "token", spokenForms: ["word unit"] },
        {
          listName: "scope_type",
          id: "sectionLevelOne",
          spokenForms: ["one section"],
        },
        {
          listName: "range_connective",
          id: "rangeExcludingStart",
          spokenForms: ["from end"],
        },
      ],
    });

    expect(
      getItem("actions", "editNewLineBefore", customCheatsheetInfo).variations,
    ).toEqual([
      { spokenForm: "gulp <target>", description: "Edit new line before" },
      {
        spokenForm: "gulp <scope> <target>",
        description: "Edit new <scope> before",
      },
    ]);
    expect(
      getItem("modifiers", "interiorOnly", customCheatsheetInfo).variations[0]
        ?.spokenForm,
    ).toBe("within");
    expect(
      getItem("scopes", "token", customCheatsheetInfo).variations[0]
        ?.spokenForm,
    ).toBe("word unit");
    expect(
      getItem("scopes", "sectionLevelOne", customCheatsheetInfo).variations[0]
        ?.spokenForm,
    ).toBe("one section");
    expect(
      getItem("compoundTargets", "rangeExcludingStart", customCheatsheetInfo)
        .variations[0]?.spokenForm,
    ).toBe("<target 1> from end <target 2>");
  });

  test("an empty raw list entry disables only the corresponding item", () => {
    const customCheatsheetInfo = getCheatsheetInfo({
      listEntries: [{ listName: "scope_type", id: "token", spokenForms: [] }],
    });

    expect(getSection("scopes", customCheatsheetInfo).items).not.toContainEqual(
      expect.objectContaining({ id: "token" }),
    );
    expect(
      getItem("actions", "swapTargets", customCheatsheetInfo),
    ).toBeDefined();
  });

  test("uses a legacy payload's spoken forms with current syntax and descriptions", () => {
    const current = getCheatsheetInfo({ includeDisabledByDefault: true });
    const legacy = getDefaultCheatsheetInfo();
    const legacyItem = getItem("actions", "editNewLineBefore", legacy);
    legacyItem.variations = [
      {
        spokenForm: "gulp <target>",
        description: "An obsolete description",
      },
    ];
    getSection("shapes", legacy).items.push({
      id: "fox",
      type: "hatShape",
      variations: [{ spokenForm: "animal", description: "Fox" }],
    });

    const result = applyLegacyCheatsheetInfo(current, legacy);

    expect(getItem("actions", "editNewLineBefore", result).variations).toEqual([
      { spokenForm: "gulp <target>", description: "Edit new line before" },
      {
        spokenForm: "gulp <scope> <target>",
        description: "Edit new <scope> before",
      },
    ]);
    expect(getItem("shapes", "fox", result).variations).toEqual([
      { spokenForm: "animal", description: "Fox" },
    ]);
  });

  test("does not re-enable items omitted from a legacy payload", () => {
    const current = getCheatsheetInfo({ includeDisabledByDefault: true });
    const legacy = getDefaultCheatsheetInfo();
    const legacyScopes = getSection("scopes", legacy);
    legacyScopes.items = legacyScopes.items.filter(({ id }) => id !== "token");

    const result = applyLegacyCheatsheetInfo(current, legacy);

    expect(getSection("scopes", result).items).not.toContainEqual(
      expect.objectContaining({ id: "token" }),
    );
  });

  // oxlint-disable-next-line unicorn/consistent-function-scoping
  function getSection(
    sectionId: string,
    info: CheatsheetInfo = cheatsheetInfo,
  ) {
    return info.sections.find(({ id }) => id === sectionId)!;
  }

  function getItem(
    sectionId: string,
    itemId: string,
    info: CheatsheetInfo = cheatsheetInfo,
  ) {
    return getSection(sectionId, info).items.find(({ id }) => id === itemId)!;
  }
});
