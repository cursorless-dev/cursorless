import { BorderStyle, Range } from "@cursorless/common";
import * as assert from "assert";
import { flattenHighlights } from "./combineHighlightStyles";
import type { Highlight, Scope } from "./types";

interface Test {
  name: string;
  scopes: Scope[];
  expected: string[];
}

const tests: Test[] = [
  {
    name: "Distant targets",
    scopes: [
      {
        targets: [{ content: "0:3-0:5" }, { content: "0:7-0:9" }],
      },
    ],
    expected: ["0:3-0:5", "0:5-0:7", "0:7-0:9"],
  },
  {
    name: "Adjacent targets",
    scopes: [
      {
        targets: [{ content: "0:3-0:5" }, { content: "0:5-0:9" }],
      },
    ],
    expected: ["0:3-0:5", "0:5-0:9"],
  },
  {
    name: "Overlapping targets",
    scopes: [
      {
        targets: [{ content: "0:3-0:5" }, { content: "0:4-0:9" }],
      },
    ],
    expected: ["0:3-0:4", "0:4-0:5", "0:5-0:9"],
  },
  {
    name: "Domain == target",
    scopes: [
      {
        domain: "0:3-0:5",
        targets: [{ content: "0:3-0:5" }],
      },
    ],
    expected: ["0:3-0:5"],
  },
  {
    name: "Domain contains target",
    scopes: [
      {
        domain: "0:3-0:6",
        targets: [{ content: "0:3-0:5" }],
      },
    ],
    expected: ["0:3-0:5", "0:5-0:6"],
  },
  {
    name: "Target contains domain",
    scopes: [
      {
        domain: "0:3-0:5",
        targets: [{ content: "0:3-0:6" }],
      },
    ],
    expected: ["0:3-0:5", "0:5-0:6"],
  },
  {
    name: "Domain overlaps target",
    scopes: [
      {
        domain: "0:3-0:5",
        targets: [{ content: "0:4-0:6" }],
      },
    ],
    expected: ["0:3-0:4", "0:4-0:5", "0:5-0:6"],
  },
];

suite("flatten highlights", () => {
  tests.forEach((t) => {
    const highlights = t.scopes.flatMap((s) => {
      const result: Highlight[] = [];
      if (s.domain) {
        result.push(createHighlight(s.domain));
      }
      result.push(...s.targets.map((t) => createHighlight(t.content)));
      return result;
    });
    test(t.name, () => {
      const actual = flattenHighlights(highlights);
      assert.equal(actual.length, t.expected.length);
      for (let i = 0; i < actual.length; i++) {
        assert.equal(actual[i].range.concise(), t.expected[i]);
      }
    });
  });
});

function createHighlight(range: string): Highlight {
  return {
    range: Range.fromConcise(range),
    style: {
      backgroundColor: "black",
      borderColorSolid: "red",
      borderColorPorous: "pink",
      borderRadius: {
        topLeft: false,
        topRight: false,
        bottomLeft: false,
        bottomRight: false,
      },
      borderStyle: {
        top: BorderStyle.none,
        bottom: BorderStyle.none,
        left: BorderStyle.none,
        right: BorderStyle.none,
      },
    },
  };
}
