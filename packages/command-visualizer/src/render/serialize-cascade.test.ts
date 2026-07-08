import assert from "node:assert/strict";
import type { Line } from "../model/columns";
import type { CascadeState, Frame } from "../model/types";
import { serializeCascade } from "./serialize-cascade";

/** A plain text line as a single hatless token (no logic/ dependency). */
function line(text: string): Line {
  return { tokens: [{ text, range: { start: 0, end: text.length } }] };
}

function frame(texts: string[]): Frame {
  return {
    role: "before",
    lines: texts.map(line),
    cursors: [],
    selections: [],
    decorations: [],
  };
}

function stateOf(...lineSets: string[][]): CascadeState {
  return { theme: "dark", tabSize: 4, frames: lineSets.map(frame) };
}

/** All line-number cell contents, in document order. */
function lineNoTexts(html: string): string[] {
  return [...html.matchAll(/<span class="cl-lineno"[^>]*>([^<]*)<\/span>/g)].map(
    (m) => m[1],
  );
}

suite("command-visualizer/serialize-cascade line numbers", () => {
  const state = stateOf(["apple", "banana", "cherry"]);

  test("on: gutter attribute on root + one 1-based .cl-lineno per line", () => {
    const html = serializeCascade(state, { lineNumbers: true });

    // (a) data-line-numbers activates the gutter on the cascade root.
    assert.ok(
      html.includes('data-line-numbers=""'),
      "root must carry data-line-numbers when on",
    );
    // Digit-count var reflects the largest line number (3 lines → 1 digit).
    assert.match(html, /--gutter-digits:1;/);

    // (b) exactly one .cl-lineno per line, numbered 1..N (1-based).
    assert.deepEqual(lineNoTexts(html), ["1", "2", "3"]);
    // One .cl-line per rendered line, so counts line up.
    assert.equal((html.match(/class="cl-line"/g) ?? []).length, 3);
  });

  test("off: no gutter attribute and no .cl-lineno", () => {
    const html = serializeCascade(state, { lineNumbers: false });
    assert.ok(!html.includes("data-line-numbers"), "no gutter attribute");
    assert.equal(lineNoTexts(html).length, 0, "no line-number cells");
  });

  test("default: identical to lineNumbers:false (opt-in, off by default)", () => {
    const defaulted = serializeCascade(state);
    const explicitOff = serializeCascade(state, { lineNumbers: false });
    assert.equal(defaulted, explicitOff);
    assert.ok(!defaulted.includes("cl-lineno"));
    assert.ok(!defaulted.includes("data-line-numbers"));
  });

  test("digit width scales to the widest line number", () => {
    // A ten-line document → largest line number "10" → 2 digits.
    const tenState = stateOf(
      Array.from({ length: 10 }, (_, i) => `line${i}`),
    );
    const html = serializeCascade(tenState, { lineNumbers: true });
    assert.match(html, /--gutter-digits:2;/);
    assert.deepEqual(lineNoTexts(html), [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
    ]);
  });

  test("gutter appears on every frame of a multi-frame cascade", () => {
    const multi = stateOf(["one", "two"], ["uno", "dos"]);
    const html = serializeCascade(multi, { lineNumbers: true });
    // Two frames × two lines = four line-number cells, numbered per frame.
    assert.deepEqual(lineNoTexts(html), ["1", "2", "1", "2"]);
    assert.equal((html.match(/class="frame"/g) ?? []).length, 2);
  });
});
