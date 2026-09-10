import assert from "node:assert/strict";
import { suite, test } from "mocha";
import type { CheatsheetInfo } from "@cursorless/lib-common/cheatsheet";
import {
  getCheatsheetInfo,
  getDefaultCheatsheetInfo,
} from "@cursorless/lib-common/cheatsheet";

suite("getDefaultCheatsheetInfo", () => {
  const cheatsheetInfo = getDefaultCheatsheetInfo();

  test("constructs action syntax from the reference definition", () => {
    assert.deepEqual(getItem("actions", "swapTargets").variations, [
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
    assert.ok(
      !getSection("actions").items.some(
        ({ id }) => id === "private.showParseTree",
      ),
    );
    assert.ok(
      !getSection("scopes").items.some(
        ({ id }) => id === "private.fieldAccess",
      ),
    );
    assert.ok(
      !getSection("scopes").items.some(({ id }) => id === "sectionLevelOne"),
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

    assert.match(
      getItem("actions", "private.showParseTree", customCheatsheetInfo)
        .variations[0]?.description ?? "",
      /\(PRIVATE\)$/u,
    );
    assert.match(
      getItem("scopes", "private.fieldAccess", customCheatsheetInfo)
        .variations[0]?.description ?? "",
      /\(PRIVATE\)$/u,
    );
  });

  test("uses canonical reference ids", () => {
    assert.notEqual(getItem("modifiers", "everyScope"), undefined);
    assert.notEqual(getItem("scopes", "surroundingPair"), undefined);
    assert.notEqual(getItem("actions", "rewrapWithPairedDelimiter"), undefined);
  });

  test("constructs default destinations", () => {
    assert.deepEqual(getSection("destinations").items, [
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
    assert.deepEqual(
      getSection("colors").items.map(({ id }) => id),
      ["blue", "green", "red", "pink", "yellow"],
    );
    assert.deepEqual(getSection("shapes").items, []);
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

    assert.deepEqual(
      getItem("actions", "editNewLineBefore", customCheatsheetInfo).variations,
      [
        { spokenForm: "gulp <target>", description: "Edit new line before" },
        {
          spokenForm: "gulp <scope> <target>",
          description: "Edit new <scope> before",
        },
      ],
    );
    assert.equal(
      getItem("modifiers", "interiorOnly", customCheatsheetInfo).variations[0]
        ?.spokenForm,
      "within",
    );
    assert.deepEqual(
      getItem("modifiers", "ancestor", customCheatsheetInfo).variations.map(
        ({ spokenForm }) => spokenForm,
      ),
      ["parental <scope>"],
    );
    assert.deepEqual(
      getItem("scopes", "token", customCheatsheetInfo).variations.map(
        ({ spokenForm }) => spokenForm,
      ),
      ["word unit"],
    );
    assert.equal(
      getItem("scopes", "sectionLevelOne", customCheatsheetInfo).variations[0]
        ?.spokenForm,
      "one section",
    );
    assert.equal(
      getItem("compoundTargets", "rangeExcludingStart", customCheatsheetInfo)
        .variations[0]?.spokenForm,
      "<target 1> from end <target 2>",
    );
    assert.equal(
      getItem("actions", "swapTargets", customCheatsheetInfo).variations[0]
        ?.spokenForm,
      "swap versus <target>",
    );
    assert.deepEqual(
      getItem("actions", "pasteFromClipboard", customCheatsheetInfo).variations,
      [
        {
          spokenForm: "paste <destination>",
          description: "Paste from clipboard at <destination>",
        },
      ],
    );
    assert.deepEqual(
      getItem("actions", "callAsFunction", customCheatsheetInfo).variations.map(
        ({ spokenForm }) => spokenForm,
      ),
      ["call <target>", "call <target 1> onto <target 2>"],
    );
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

    assert.equal(
      getItem("actions", "swapTargets", customCheatsheetInfo).variations[0]
        ?.spokenForm,
      "swap next <target>",
    );
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

    assert.deepEqual(
      getItem(
        "actions",
        "editor.action.moveLinesDownAction",
        customCheatsheetInfo,
      ),
      {
        id: "editor.action.moveLinesDownAction",
        type: "action",
        variations: [
          {
            spokenForm: "push down <target>",
            description: "Editor action move lines down action",
          },
        ],
      },
    );
    assert.ok(
      !getSection("actions", customCheatsheetInfo).items.some(
        ({ id }) => id === "disabled.action",
      ),
    );
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

    assert.deepEqual(
      getItem("scopes", "customRegex.dotted", customCheatsheetInfo),
      {
        id: "customRegex.dotted",
        type: "scopeType",
        variations: [
          {
            spokenForm: "dotted",
            description: String.raw`/[\w.]+/`,
          },
        ],
      },
    );
    assert.ok(
      !getSection("scopes", customCheatsheetInfo).items.some(
        ({ id }) => id === "customRegex.disabled",
      ),
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

    assert.ok(
      !getSection("scopes", customCheatsheetInfo).items.some(
        ({ id }) => id === "token",
      ),
    );
    assert.notEqual(
      getItem("actions", "swapTargets", customCheatsheetInfo),
      undefined,
    );
  });

  test("omits syntax examples whose spoken form is missing or disabled", () => {
    const customCheatsheetInfo = getCheatsheetInfo([
      { type: "action", id: "callAsFunction", spokenForms: ["call"] },
      { type: "action", id: "swapTargets", spokenForms: ["swap"] },
      { type: "connective", id: "swapConnective", spokenForms: [] },
    ]);

    assert.deepEqual(
      getItem("actions", "callAsFunction", customCheatsheetInfo).variations,
      [
        {
          spokenForm: "call <target>",
          description: "Insert call to <target> on selection",
        },
      ],
    );
    assert.ok(
      !getSection("actions", customCheatsheetInfo).items.some(
        ({ id }) => id === "swapTargets",
      ),
    );
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

    assert.deepEqual(getSection("destinations", customCheatsheetInfo).items, [
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

    assert.deepEqual(
      getItem("scopeVisualizer", "show_scope_visualizer", customCheatsheetInfo)
        .variations,
      [
        {
          spokenForm: "inspect <scope>",
          description: "Visualize <scope>",
        },
        {
          spokenForm: "inspect <scope> deletion",
          description: "Visualize <scope> removal range",
        },
      ],
    );
    assert.ok(
      !getSection("scopeVisualizer", customCheatsheetInfo).items.some(
        ({ id }) => id === "hideScopeVisualizer",
      ),
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
