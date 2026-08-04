// Shared HTML helpers for the serializers (serialize, serialize-cascade,
// svg-wrap, jumbotron). Single home for the attribute-safe escaper and the
// caption block so each serializer doesn't re-derive them (and can't drift out
// of sync — three of the four copies had differing quote-escaping before this
// was consolidated).

import type { CascadeState } from "../model/types";

/**
 * HTML escaper safe for BOTH text content AND quoted-attribute contexts.
 * `&` is escaped first (so it can't double-escape the entities below), then the
 * tag delimiters, then BOTH quote characters. Escaping the quotes is what closes
 * the CodeQL "incomplete HTML attribute sanitization" finding: fixture /
 * spoken-form strings are interpolated into double-quoted attributes
 * (data-fixture="…", data-spoken-form="…") and an unescaped `"` would break out
 * of the attribute. Over-escaping quotes in text content is harmless —
 * &quot; / &#39; render as " / '.
 */
export function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Editor-surface page background for a theme (delivered SVG / standalone doc). */
export function themeBackground(theme: "dark" | "light"): string {
  return theme === "dark" ? "#141414" : "#e8e8e8";
}

/**
 * The `.cl-caption` block built from a state's meta (spoken form · action ·
 * fixture). Returns "" when there is no meta. Shared by the cascade document
 * and the delivered-SVG wrapper.
 */
export function captionHtml(meta: CascadeState["meta"]): string {
  if (!meta) {
    return "";
  }
  return `<div class="cl-caption">${esc(
    [meta.spokenForm && `"${meta.spokenForm}"`, meta.action, meta.fixture]
      .filter(Boolean)
      .join("  ·  "),
  )}</div>`;
}
