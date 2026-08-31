import { describe, expect, test } from "@jest/globals";
import type { CheatsheetInfo } from "@cursorless/lib-common/cheatsheet";
import {
  getCheatsheetInfo,
  getDefaultCheatsheetInfo,
} from "@cursorless/lib-common/cheatsheet";

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
      expect.objectContaining({ id: "private.fieldAccess" }),
    );
    expect(getSection("scopes").items).not.toContainEqual(
      expect.objectContaining({ id: "sectionLevelOne" }),
    );
  });

  test("includes private references with actual spoken forms", () => {
    const customCheatsheetInfo = getCheatsheetInfo([
      {
        type: "action",
        id: "private.showParseTree",
        spokenForms: ["inspect parse tree"],
      },
      {
        type: "simpleScopeTypeType",
        id: "private.fieldAccess",
        spokenForms: ["access"],
      },
    ]);

    expect(
      getItem("actions", "private.showParseTree", customCheatsheetInfo)
        .variations[0]?.description,
    ).toMatch(/\(PRIVATE\)$/u);
    expect(
      getItem("scopes", "private.fieldAccess", customCheatsheetInfo)
        .variations[0]?.description,
    ).toMatch(/\(PRIVATE\)$/u);
  });

  test("uses canonical reference ids", () => {
    expect(getItem("modifiers", "everyScope")).toBeDefined();
    expect(getItem("scopes", "surroundingPair")).toBeDefined();
    expect(getItem("actions", "rewrapWithPairedDelimiter")).toBeDefined();
  });

  test("constructs default destinations", () => {
    expect(getSection("destinations").items).toEqual([
      {
        id: "destination_after",
        type: "destination",
        variations: [
          {
            spokenForm: "after <target>",
            description: "Insert after <target>",
          },
        ],
      },
      {
        id: "destination_before",
        type: "destination",
        variations: [
          {
            spokenForm: "before <target>",
            description: "Insert before <target>",
          },
        ],
      },
      {
        id: "destination_to",
        type: "destination",
        variations: [
          {
            spokenForm: "to <target>",
            description: "Replace <target>",
          },
        ],
      },
    ]);
  });

  test("includes only colors and shapes that are enabled by default", () => {
    expect(getSection("colors").items.map(({ id }) => id)).toEqual([
      "blue",
      "green",
      "red",
      "pink",
      "yellow",
    ]);
    expect(getSection("shapes").items).toEqual([]);
  });

  test("applies Talon spoken-form entries to the current syntax", () => {
    const customCheatsheetInfo = getCheatsheetInfo([
      {
        type: "action",
        id: "editNewLineBefore",
        spokenForms: ["gulp"],
      },
      { type: "action", id: "swapTargets", spokenForms: ["swap"] },
      {
        type: "action",
        id: "pasteFromClipboard",
        spokenForms: ["paste", "plop"],
      },
      { type: "action", id: "callAsFunction", spokenForms: ["call"] },
      {
        type: "modifierExtra",
        id: "ancestor",
        spokenForms: ["parental", "ancestral"],
      },
      {
        type: "simpleModifier",
        id: "interiorOnly",
        spokenForms: ["within"],
      },
      { type: "connective", id: "on", spokenForms: ["onto", "upon"] },
      {
        type: "simpleScopeTypeType",
        id: "token",
        spokenForms: ["word unit", "lexeme"],
      },
      {
        type: "simpleScopeTypeType",
        id: "sectionLevelOne",
        spokenForms: ["one section"],
      },
      {
        type: "connective",
        id: "rangeExcludingStart",
        spokenForms: ["from end"],
      },
      {
        type: "connective",
        id: "swapConnective",
        spokenForms: ["versus"],
      },
    ]);

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
      getItem("modifiers", "ancestor", customCheatsheetInfo).variations.map(
        ({ spokenForm }) => spokenForm,
      ),
    ).toEqual(["parental <scope>"]);
    expect(
      getItem("scopes", "token", customCheatsheetInfo).variations.map(
        ({ spokenForm }) => spokenForm,
      ),
    ).toEqual(["word unit"]);
    expect(
      getItem("scopes", "sectionLevelOne", customCheatsheetInfo).variations[0]
        ?.spokenForm,
    ).toBe("one section");
    expect(
      getItem("compoundTargets", "rangeExcludingStart", customCheatsheetInfo)
        .variations[0]?.spokenForm,
    ).toBe("<target 1> from end <target 2>");
    expect(
      getItem("actions", "swapTargets", customCheatsheetInfo).variations[0]
        ?.spokenForm,
    ).toBe("swap versus <target>");
    expect(
      getItem("actions", "pasteFromClipboard", customCheatsheetInfo).variations,
    ).toEqual([
      {
        spokenForm: "paste <destination>",
        description: "Paste from clipboard at <destination>",
      },
    ]);
    expect(
      getItem("actions", "callAsFunction", customCheatsheetInfo).variations.map(
        ({ spokenForm }) => spokenForm,
      ),
    ).toEqual(["call <target>", "call <target 1> onto <target 2>"]);
  });

  test("does not apply replacements to customized spoken forms", () => {
    const customCheatsheetInfo = getCheatsheetInfo([
      { type: "action", id: "swapTargets", spokenForms: ["swap"] },
      {
        type: "connective",
        id: "swapConnective",
        spokenForms: ["next"],
      },
      { type: "modifierExtra", id: "next", spokenForms: ["afterward"] },
    ]);

    expect(
      getItem("actions", "swapTargets", customCheatsheetInfo).variations[0]
        ?.spokenForm,
    ).toBe("swap next <target>");
  });

  test("includes only the first spoken form for custom actions", () => {
    const customCheatsheetInfo = getCheatsheetInfo([
      {
        type: "customAction",
        id: "editor.action.moveLinesDownAction",
        spokenForms: ["push down", "shove down"],
      },
      {
        type: "customAction",
        id: "disabled.action",
        spokenForms: [],
      },
    ]);

    expect(
      getItem(
        "actions",
        "editor.action.moveLinesDownAction",
        customCheatsheetInfo,
      ),
    ).toEqual({
      id: "editor.action.moveLinesDownAction",
      type: "action",
      variations: [
        {
          spokenForm: "push down <target>",
          description: "Editor action move lines down action",
        },
      ],
    });
    expect(
      getSection("actions", customCheatsheetInfo).items,
    ).not.toContainEqual(expect.objectContaining({ id: "disabled.action" }));
  });

  test("includes custom regex scopes", () => {
    const customCheatsheetInfo = getCheatsheetInfo([
      {
        type: "customRegex",
        id: String.raw`[\w.]+`,
        spokenForms: ["dotted", "dotty"],
      },
      {
        type: "customRegex",
        id: "disabled",
        spokenForms: [],
      },
    ]);

    expect(
      getItem("scopes", "customRegex.dotted", customCheatsheetInfo),
    ).toEqual({
      id: "customRegex.dotted",
      type: "scopeType",
      variations: [
        {
          spokenForm: "dotted",
          description: String.raw`/[\w.]+/`,
        },
      ],
    });
    expect(getSection("scopes", customCheatsheetInfo).items).not.toContainEqual(
      expect.objectContaining({ id: "customRegex.disabled" }),
    );
  });

  test("an empty spoken-form entry disables only the corresponding item", () => {
    const customCheatsheetInfo = getCheatsheetInfo([
      { type: "simpleScopeTypeType", id: "token", spokenForms: [] },
      { type: "action", id: "swapTargets", spokenForms: ["swap"] },
      {
        type: "connective",
        id: "swapConnective",
        spokenForms: ["with"],
      },
    ]);

    expect(getSection("scopes", customCheatsheetInfo).items).not.toContainEqual(
      expect.objectContaining({ id: "token" }),
    );
    expect(
      getItem("actions", "swapTargets", customCheatsheetInfo),
    ).toBeDefined();
  });

  test("omits syntax examples whose spoken form is missing or disabled", () => {
    const customCheatsheetInfo = getCheatsheetInfo([
      { type: "action", id: "callAsFunction", spokenForms: ["call"] },
      { type: "action", id: "swapTargets", spokenForms: ["swap"] },
      { type: "connective", id: "swapConnective", spokenForms: [] },
    ]);

    expect(
      getItem("actions", "callAsFunction", customCheatsheetInfo).variations,
    ).toEqual([
      {
        spokenForm: "call <target>",
        description: "Insert call to <target> on selection",
      },
    ]);
    expect(
      getSection("actions", customCheatsheetInfo).items,
    ).not.toContainEqual(expect.objectContaining({ id: "swapTargets" }));
  });

  test("constructs destinations only from enabled spoken forms", () => {
    const customCheatsheetInfo = getCheatsheetInfo([
      {
        type: "insertionMode",
        id: "before",
        spokenForms: ["ahead of", "prior to"],
      },
      { type: "insertionMode", id: "to", spokenForms: ["toward"] },
    ]);

    expect(getSection("destinations", customCheatsheetInfo).items).toEqual([
      {
        id: "destination_before",
        type: "destination",
        variations: [
          {
            spokenForm: "ahead of <target>",
            description: "Insert before <target>",
          },
        ],
      },
      {
        id: "destination_to",
        type: "destination",
        variations: [
          {
            spokenForm: "toward <target>",
            description: "Replace <target>",
          },
        ],
      },
    ]);
  });

  test("constructs scope visualizer commands from enabled spoken forms", () => {
    const customCheatsheetInfo = getCheatsheetInfo([
      {
        type: "scopeVisualizer",
        id: "showScopeVisualizer",
        spokenForms: ["inspect", "visualize"],
      },
      {
        type: "scopeVisualizer",
        id: "hideScopeVisualizer",
        spokenForms: [],
      },
      {
        type: "scopeVisualizer",
        id: "removal",
        spokenForms: ["deletion"],
      },
    ]);

    expect(
      getItem("scopeVisualizer", "show_scope_visualizer", customCheatsheetInfo)
        .variations,
    ).toEqual([
      {
        spokenForm: "inspect <scope>",
        description: "Visualize <scope>",
      },
      {
        spokenForm: "inspect <scope> deletion",
        description: "Visualize <scope> removal range",
      },
    ]);
    expect(
      getSection("scopeVisualizer", customCheatsheetInfo).items,
    ).not.toContainEqual(
      expect.objectContaining({ id: "hideScopeVisualizer" }),
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
