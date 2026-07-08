import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HAT_SHAPES } from "@cursorless/lib-common";
import { SHAPE_PATHS } from "./shapes";

// Single-source guard: SHAPE_PATHS carries byte-for-byte copies of the hat SVG
// `d=` path data, because a headless renderer can't read the .svg files at
// runtime (bundled/serverless path never touches disk). This test makes
// `resources/images/hats/*.svg` the enforced source of truth — if a shape's
// path (or crosshairs' fill-rule) ever drifts from the checked-in copy, this
// fails and points at the exact shape to re-sync. Runtime stays pure; the fs
// read lives here, at test time, only.

const HATS_DIR = new URL(
  "../../../../resources/images/hats/",
  import.meta.url,
);

function svgOf(shape: string): string {
  return readFileSync(new URL(`${shape}.svg`, HATS_DIR), "utf8");
}

suite("command-visualizer/data/shapes", () => {
  test("SHAPE_PATHS covers exactly the hat shapes", () => {
    assert.deepEqual(
      Object.keys(SHAPE_PATHS).sort(),
      [...HAT_SHAPES].sort(),
    );
  });

  test("every SHAPE_PATHS entry matches resources/images/hats/<shape>.svg", () => {
    for (const shape of HAT_SHAPES) {
      const svg = svgOf(shape);

      const d = /<path[^>]*\sd="([^"]+)"/u.exec(svg)?.[1];
      assert.equal(
        SHAPE_PATHS[shape].d,
        d,
        `d= drift for shape "${shape}" — re-sync from resources/images/hats/${shape}.svg`,
      );

      const fillRule = /fill-rule="([^"]+)"/u.exec(svg)?.[1];
      assert.equal(
        SHAPE_PATHS[shape].fillRule,
        fillRule,
        `fill-rule drift for shape "${shape}"`,
      );
    }
  });
});
