import assert from "node:assert/strict";
import { parseFixtureYaml } from "./fixture-yaml";

suite("command-visualizer/fixture-yaml", () => {
  suite("parseFixtureYaml", () => {
    test("returns {} for an empty string (js-yaml 5.x throws otherwise)", () => {
      assert.deepEqual(parseFixtureYaml(""), {});
    });

    test("returns {} for whitespace-only input", () => {
      assert.deepEqual(parseFixtureYaml("   \n\t  \n"), {});
    });

    test("parses a block mapping into a plain object", () => {
      const result = parseFixtureYaml("command:\n  spokenForm: change token\n");
      assert.deepEqual(result, { command: { spokenForm: "change token" } });
    });

    test("returns {} for a top-level scalar (not a mapping)", () => {
      assert.deepEqual(parseFixtureYaml("just a string"), {});
    });

    test("returns {} for a top-level sequence (not a mapping)", () => {
      assert.deepEqual(parseFixtureYaml("- a\n- b\n"), {});
    });

    test("preserves a literal block scalar byte-for-byte", () => {
      const result = parseFixtureYaml("documentContents: |\n  a\n  b\n");
      assert.equal(result.documentContents, "a\nb\n");
    });
  });
});
