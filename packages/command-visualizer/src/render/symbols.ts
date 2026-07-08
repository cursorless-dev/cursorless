// Symbol sheet — SPEC §3 / §4.1.
// Emits the shared inline <svg><defs> with 11 <symbol> defs ONCE per document.
// Each path + per-shape fill-rule is verbatim from source (src/data/shapes.ts);
// fill="currentColor" so a hat is tinted by CSS `color` (D4).

import { HAT_SHAPES } from "@cursorless/lib-common";
import { SHAPE_PATHS } from "../data/shapes";

export function symbolSheet(): string {
  const symbols = HAT_SHAPES.map((shape) => {
    const { d, fillRule } = SHAPE_PATHS[shape];
    const ruleAttr =
      fillRule === "evenodd" ? ` fill-rule="evenodd" clip-rule="evenodd"` : "";
    return (
      `    <symbol id="hat-${shape}" viewBox="0 0 12 9">` +
      `<path d="${d}"${ruleAttr} fill="currentColor"/>` +
      `</symbol>`
    );
  }).join("\n");

  return (
    `  <svg xmlns="http://www.w3.org/2000/svg" class="cl-defs" aria-hidden="true" width="0" height="0">\n` +
    `    <defs>\n${symbols}\n    </defs>\n` +
    `  </svg>`
  );
}
