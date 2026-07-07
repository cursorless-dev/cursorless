// Portable resolution of the cursorless repo root and its fixture subpaths.
//
// Resolution order:
//   1. $CURSORLESS_REPO env var (explicit override — CI, alt checkouts)
//   2. $HOME/code/cursorless (sensible default, NOT a hardcoded user)
//
// Layout probe: the local repo may use either of two directory structures:
//   A (mini2 fork):  resources/images/hats/  +  resources/fixtures/recorded/
//   B (main repo):   images/hats/             +  data/fixtures/recorded/
//
// Throws a CLEAR error if the resolved root does not exist, so a misconfigured
// checkout fails loudly at startup instead of with an opaque ENOENT mid-run.
//
// Dedup note (step 4b): @cursorless/lib-node-common exports getFixturesPath /
// getRecordedTestsDirPath, but they hardcode the single `resources/fixtures`
// layout and offer no $CURSORLESS_REPO override. This module deliberately keeps
// its dual-layout probe (resources/… fork vs data/… main repo) plus the env
// override and loud errors, so it works across both checkout shapes the
// renderer targets. Adopting lib-node-common's helpers would be a regression.

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/** Absolute path to the cursorless repo root (env override, else $HOME/code/cursorless). */
export function cursorlessRepoRoot(): string {
  const fromEnv = process.env.CURSORLESS_REPO?.trim();
  const root =
    fromEnv && fromEnv.length > 0
      ? fromEnv
      : join(homedir(), "code", "cursorless");

  if (!existsSync(root)) {
    const how = fromEnv
      ? '$CURSORLESS_REPO is set to "' + root + '"'
      : 'defaulted to "' + root + '" ($HOME/code/cursorless)';
    throw new Error(
      `cursorless repo not found: ${how}, but that path does not exist.\n` +
        `Set CURSORLESS_REPO to your cursorless checkout, e.g.\n` +
        `  CURSORLESS_REPO=/path/to/cursorless bun run verify`,
    );
  }
  return root;
}

/** Detect which directory layout the repo uses and return the hats dir. */
export function hatsRoot(): string {
  const root = cursorlessRepoRoot();
  // Layout A (mini2 fork): resources/images/hats/
  const layoutA = join(root, "resources", "images", "hats");
  if (existsSync(layoutA)) {
    return layoutA;
  }
  // Layout B (main repo): images/hats/
  const layoutB = join(root, "images", "hats");
  if (existsSync(layoutB)) {
    return layoutB;
  }
  throw new Error(
    `cursorless hat SVGs not found in "${root}".\n` +
      `Expected one of:\n  ${layoutA}\n  ${layoutB}`,
  );
}

/** Detect which directory layout the repo uses and return the recorded fixtures dir. */
export function fixtureRoot(): string {
  const root = cursorlessRepoRoot();
  // Layout A (mini2 fork): resources/fixtures/recorded/
  const layoutA = join(root, "resources", "fixtures", "recorded");
  if (existsSync(layoutA)) {
    return layoutA;
  }
  // Layout B (main repo): data/fixtures/recorded/
  const layoutB = join(root, "data", "fixtures", "recorded");
  if (existsSync(layoutB)) {
    return layoutB;
  }
  throw new Error(
    `cursorless recorded fixtures not found in "${root}".\n` +
      `Expected one of:\n  ${layoutA}\n  ${layoutB}`,
  );
}
