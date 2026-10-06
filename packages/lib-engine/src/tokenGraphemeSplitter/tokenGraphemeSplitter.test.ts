// oxlint-disable no-inline-comments
import assert from "node:assert/strict";
import type { TalonSpokenForms } from "@cursorless/lib-common";
import {
  FakeIDE,
  FakeTalonSpokenForms,
  Notifier,
} from "@cursorless/lib-common";
import { TokenGraphemeSplitter, UNKNOWN } from "./tokenGraphemeSplitter";

/**
 * Compact representation of a grapheme to make the tests easier to read.
 * Expected to be of the form
 * [text, tokenStartOffset, tokenEndOffset]
 */
type CompactGrapheme = [string, number, number];

/**
 * A compact representation of a test case. Expected to be of the form
 * [input, expectedOutput]
 */
type TestCase = [string, CompactGrapheme[]];

interface SplittingModeTestCases {
  graphemes: string[];
  extraTestCases: TestCase[];
}

const commonTestCases: TestCase[] = [
  [
    "hi",
    [
      ["h", 0, 1],
      ["i", 1, 2],
    ],
  ],
  ["_", [["_", 0, 1]]],
  ["😄", [[UNKNOWN, 0, 2]]],
];

const tests: SplittingModeTestCases[] = [
  {
    graphemes: [],
    extraTestCases: [
      [
        "\u00F1", // ñ as single codepoint
        [["n", 0, 1]],
      ],
      [
        "\u006E\u0303", // ñ using combining mark
        [["n", 0, 2]],
      ],
      [
        "\u00D1", // Ñ as single codepoint
        [["n", 0, 1]],
      ],
      [
        "\u004E\u0303", // Ñ using combining mark
        [["n", 0, 2]],
      ],
      ["ꝏ", [[UNKNOWN, 0, 1]]],
      ["ø", [["o", 0, 1]]],
      ["æ", [[UNKNOWN, 0, 1]]],
      ["Ꝏ", [[UNKNOWN, 0, 1]]],
      ["Ø", [["o", 0, 1]]],
      ["Æ", [[UNKNOWN, 0, 1]]],
      ["Σ", [[UNKNOWN, 0, 1]]],
      ["σ", [[UNKNOWN, 0, 1]]],
    ],
  },
  {
    graphemes: [],
    extraTestCases: [
      [
        "\u00F1", // ñ as single codepoint
        [["n", 0, 1]],
      ],
      [
        "\u006E\u0303", // ñ using combining mark
        [["n", 0, 2]],
      ],
      [
        "\u00D1", // Ñ as single codepoint
        [["n", 0, 1]],
      ],
      [
        "\u004E\u0303", // Ñ using combining mark
        [["n", 0, 2]],
      ],
      ["ꝏ", [[UNKNOWN, 0, 1]]],
      ["ø", [["o", 0, 1]]],
      ["æ", [[UNKNOWN, 0, 1]]],
      ["Ꝏ", [[UNKNOWN, 0, 1]]],
      ["Ø", [["o", 0, 1]]],
      ["Æ", [[UNKNOWN, 0, 1]]],
    ],
  },
  {
    graphemes: [
      "\u00E4", // ä, NFC-normalised
      "\u00E5", // å, NFC-normalised
      "ꝏ",
      "ø",
      "æ",
    ],
    extraTestCases: [
      [
        "\u00F1", // ñ as single codepoint
        [["n", 0, 1]],
      ],
      [
        "\u006E\u0303", // ñ using combining mark
        [["n", 0, 2]],
      ],
      [
        "\u00D1", // Ñ as single codepoint
        [["n", 0, 1]],
      ],
      [
        "\u004E\u0303", // Ñ using combining mark
        [["n", 0, 2]],
      ],
      [
        "\u00E4\u00E5", // äå, NFC-normalised
        [
          ["\u00E4", 0, 1], // ä, NFC-normalised
          ["\u00E5", 1, 2], // å, NFC-normalised
        ],
      ],
      [
        "\u0061\u0308\u0061\u030A", // äå, NFD-normalised
        [
          ["\u00E4", 0, 2], // ä, NFC-normalised
          ["\u00E5", 2, 4], // å, NFC-normalised
        ],
      ],
      [
        "\u00C4\u00C5", // ÄÅ, NFC-normalised
        [
          ["\u00E4", 0, 1], // ä, NFC-normalised
          ["\u00E5", 1, 2], // å, NFC-normalised
        ],
      ],
      [
        "\u0041\u0308\u0041\u030A", // ÄÅ, NFD-normalised
        [
          ["\u00E4", 0, 2], // ä, NFC-normalised
          ["\u00E5", 2, 4], // å, NFC-normalised
        ],
      ],
      ["ꝏ", [["ꝏ", 0, 1]]],
      ["ø", [["ø", 0, 1]]],
      ["æ", [["æ", 0, 1]]],
      ["Ꝏ", [["ꝏ", 0, 1]]],
      ["Ø", [["ø", 0, 1]]],
      ["Æ", [["æ", 0, 1]]],
    ],
  },
  {
    graphemes: [
      "\u0061\u0308", // ä, NFD-normalised
      "\u0061\u030A", // å, NFD-normalised
    ],
    extraTestCases: [
      [
        "\u00E4\u00E5", // äå, NFC-normalised
        [
          ["\u00E4", 0, 1],
          ["\u00E5", 1, 2],
        ],
      ],
      [
        "\u0061\u0308\u0061\u030A", // äå, NFD-normalised
        [
          ["\u00E4", 0, 2],
          ["\u00E5", 2, 4],
        ],
      ],
    ],
  },
  {
    graphemes: [
      "\u00E4", // ä, NFC-normalised
      "\u00E5", // å, NFC-normalised
      "ꝏ",
      "ø",
      "æ",
    ],
    extraTestCases: [
      [
        "\u00E4\u00E5", // äå, NFC-normalised
        [
          ["\u00E4", 0, 1],
          ["\u00E5", 1, 2],
        ],
      ],
      [
        "\u00C4\u00C5", // ÄÅ, NFC-normalised
        [
          ["\u00E4", 0, 1], // ä, NFC-normalised
          ["\u00E5", 1, 2], // å, NFC-normalised
        ],
      ],
      ["ꝏ", [["ꝏ", 0, 1]]],
      ["ø", [["ø", 0, 1]]],
      ["æ", [["æ", 0, 1]]],
      ["Ꝏ", [["ꝏ", 0, 1]]],
      ["Ø", [["ø", 0, 1]]],
      ["Æ", [["æ", 0, 1]]],
    ],
  },
  {
    graphemes: [
      "\u00C4", // Ä, NFC-
      "\u00C5", // Å, NFC-normalised
      "Ꝏ",
      "Ø",
      "Æ",
    ],
    extraTestCases: [
      [
        "\u00E4\u00E5", // äå, NFC-normalised
        [
          ["a", 0, 1],
          ["a", 1, 2],
        ],
      ],
      [
        "\u00C4\u00C5", // ÄÅ, NFC-normalised
        [
          ["\u00C4", 0, 1], // Ä, NFC-normalised
          ["\u00C5", 1, 2], // Å, NFC-normalised
        ],
      ],
      ["ꝏ", [[UNKNOWN, 0, 1]]],
      ["ø", [["o", 0, 1]]],
      ["æ", [[UNKNOWN, 0, 1]]],
      ["Ꝏ", [["Ꝏ", 0, 1]]],
      ["Ø", [["Ø", 0, 1]]],
      ["Æ", [["Æ", 0, 1]]],
    ],
  },
  {
    graphemes: ["🙃", "Σ", "σ"],
    extraTestCases: [
      [
        "\u00F1", // ñ as single codepoint
        [["n", 0, 1]],
      ],
      [
        "\u006E\u0303", // ñ using combining mark
        [["n", 0, 2]],
      ],
      [
        "\u00D1", // Ñ as single codepoint
        [["n", 0, 1]],
      ],
      [
        "\u004E\u0303", // Ñ using combining mark
        [["n", 0, 2]],
      ],
      ["Σ", [["Σ", 0, 1]]],
      ["σ", [["σ", 0, 1]]],
    ],
  },
];

for (const { graphemes, extraTestCases } of tests) {
  suite(`getTokenGraphemes(${JSON.stringify(graphemes)})`, () => {
    const ide = new FakeIDE();
    const talonSpokenForms = FakeTalonSpokenForms.fromGraphemes(graphemes);
    const testCases = [...commonTestCases, ...extraTestCases];

    for (const [input, compactExpectedOutput] of testCases) {
      const expectedOutput = compactExpectedOutput.map(
        ([text, tokenStartOffset, tokenEndOffset]) => ({
          text,
          tokenStartOffset,
          tokenEndOffset,
        }),
      );

      const displayOutput = expectedOutput.map(({ text }) => text).join(", ");

      test(`${input} -> ${displayOutput}`, async () => {
        const splitter = new TokenGraphemeSplitter(ide, talonSpokenForms);
        await splitter.ready;
        const actualOutput = splitter.getTokenGraphemes(input);
        assert.deepEqual(actualOutput, expectedOutput);
      });
    }
  });
}

suite("Grapheme updates", () => {
  test("only notifies when the normalized grapheme set changes", async () => {
    let graphemes = ["ä", "ø"];
    // oxlint-disable-next-line unicorn/consistent-function-scoping
    let update: () => void | Promise<void> = () => {
      // No-op
    };
    const spokenForms: TalonSpokenForms = {
      getSpokenForms: () =>
        FakeTalonSpokenForms.fromGraphemes(graphemes).getSpokenForms(),
      onDidChange: (listener) => {
        update = listener;
        return {
          dispose: () => {
            // No-op
          },
        };
      },
    };
    const ide = new FakeIDE();
    const splitter = new TokenGraphemeSplitter(ide, spokenForms);
    await splitter.ready;
    let notifications = 0;
    splitter.registerAlgorithmChangeListener(() => {
      notifications++;
    });

    try {
      await update();
      assert.equal(notifications, 0);

      // Ordering, duplicates, default graphemes, and NFC normalization do not
      // change the effective set.
      graphemes = ["ø", "a\u0308", "ø", "a"];
      await update();
      assert.equal(notifications, 0);

      graphemes = ["ø"];
      await update();
      assert.equal(notifications, 1);
      assert.equal(splitter.normalizeGrapheme("ä"), "a");

      graphemes = ["ø", "ä"];
      await update();
      assert.equal(notifications, 2);
      assert.equal(splitter.normalizeGrapheme("ä"), "ä");
    } finally {
      ide.exit();
    }
  });
});

suite("Grapheme loading failures", () => {
  test("initialization uses defaults when loading fails", async () => {
    const spokenForms: TalonSpokenForms = {
      getSpokenForms: () => Promise.reject(new SyntaxError("Invalid JSON")),
      onDidChange: new Notifier().registerListener,
    };
    const splitter = new TokenGraphemeSplitter(new FakeIDE(), spokenForms);

    await splitter.ready;

    assert.equal(splitter.normalizeGrapheme("A"), "a");
    assert.equal(splitter.normalizeGrapheme("ä"), "a");
  });

  test("a failed update restores defaults and a later update recovers", async () => {
    const notifier = new Notifier();
    let fail = false;
    const customForms = FakeTalonSpokenForms.fromGraphemes(["ä"]);
    const spokenForms: TalonSpokenForms = {
      getSpokenForms: () =>
        fail
          ? Promise.reject(new SyntaxError("Invalid JSON"))
          : customForms.getSpokenForms(),
      onDidChange: notifier.registerListener,
    };
    const splitter = new TokenGraphemeSplitter(new FakeIDE(), spokenForms);
    await splitter.ready;
    assert.equal(splitter.normalizeGrapheme("ä"), "ä");

    const update = () =>
      new Promise<void>((resolve) => {
        const disposable = splitter.registerAlgorithmChangeListener(() => {
          disposable.dispose();
          resolve();
        });
        notifier.notifyListeners();
      });

    fail = true;
    await update();
    assert.equal(splitter.normalizeGrapheme("ä"), "a");

    fail = false;
    await update();
    assert.equal(splitter.normalizeGrapheme("ä"), "ä");
  });
});
