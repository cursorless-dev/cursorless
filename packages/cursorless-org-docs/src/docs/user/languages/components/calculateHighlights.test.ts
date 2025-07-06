import * as assert from "assert";
import { calculateHighlights } from "./calculateHighlights";
import type { Fixture, Scope } from "./types";

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
    expected: ["0:3-0:5", "0:7-0:9"],
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
    expected: ["0:3-0:5", "0:4-0:5", "0:5-0:9"],
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
    expected: ["0:3-0:5", "0:3-0:6"],
  },
  {
    name: "Target contains domain",
    scopes: [
      {
        domain: "0:3-0:5",
        targets: [{ content: "0:3-0:6" }],
      },
    ],
    expected: ["0:3-0:6", "0:3-0:5"],
  },
  {
    name: "Domain overlaps target",
    scopes: [
      {
        domain: "0:3-0:5",
        targets: [{ content: "0:4-0:6" }],
      },
    ],
    expected: ["0:4-0:6"],
  },
];

suite("calculate highlights", () => {
  tests.forEach((t) => {
    const fixture: Fixture = {
      name: t.name,
      scopes: t.scopes,
      facet: "line",
      languageId: "plaintext",
      code: "",
    };
    test(fixture.name, () => {
      const highlights = calculateHighlights(fixture, "content");
      assert.equal(highlights.length, t.expected.length);
      for (let i = 0; i < highlights.length; i++) {
        assert.equal(highlights[i].range.concise(), t.expected[i]);
      }
    });
  });
});
