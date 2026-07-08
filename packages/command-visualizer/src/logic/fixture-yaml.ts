// Fixture YAML reader.
//
// Was a hand-rolled parser for the recorded-fixture YAML subset (block maps,
// block scalars, block sequences, flow maps). Replaced with cursorless's own
// YAML library, `js-yaml` — the same dependency and the same `load()` entry
// point `@cursorless/lib-node-common`'s loadFixture.ts uses to read these
// fixtures. This drops ~250 lines of bespoke parser and the yaml-scalars.ts
// primitives module in favor of the battle-tested lib, while preserving the
// exported surface (`parseFixtureYaml`, `YamlValue`) that fixture-extract.ts
// and pipeline.ts depend on.
//
// Byte-exact `documentContents` (GATE 0) is preserved: js-yaml's literal block
// scalar (`|` / `|N`) handling is the reference implementation the hand-rolled
// reader was mimicking.

import { load } from "js-yaml";

/**
 * Recursive JSON-ish value produced by parsing a fixture YAML document. Matches
 * the shape js-yaml's default schema yields for the recorded-fixture subset
 * (scalars, block/flow maps, block sequences). Kept stable for downstream
 * consumers (fixture-extract.ts coerces via asObj/asArr/num/pos).
 */
export type YamlValue =
  | string
  | number
  | boolean
  | null
  | YamlValue[]
  | { [k: string]: YamlValue };

/**
 * Parse a full fixture YAML document into a plain object. Returns `{}` for an
 * empty/null document so callers can index into it unconditionally.
 */
export function parseFixtureYaml(src: string): { [k: string]: YamlValue } {
  // js-yaml 5.x throws on null/undefined input; guard so the `{}` fallback
  // is actually reachable for blank or whitespace-only fixture strings.
  if (!src || !src.trim()) {
    return {};
  }
  const value = load(src) as YamlValue | undefined;
  if (value != null && typeof value === "object" && !Array.isArray(value)) {
    return value as { [k: string]: YamlValue };
  }
  return {};
}
