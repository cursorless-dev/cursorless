import assert from "node:assert/strict";
import type { HatColor } from "@cursorless/lib-common";
import type { InputHat, Line, Token } from "../model/columns";
import { allocateHats, cssStateHatStyles } from "./hat-allocator";

// Build a Line whose tokens are one-per-grapheme (the render model, tokenize.ts
// R5) with line-relative UTF-16 ranges. Spaces are emitted as their own tokens
// so offsets stay contiguous, matching what buildLines/tokenizeDoc produces.
function line(text: string): Line {
  const tokens: Token[] = [];
  for (let i = 0; i < text.length; i++) {
    tokens.push({ text: text[i], range: { start: i, end: i + 1 } });
  }
  return { tokens };
}

/** Attach a fixture-mark hat to the token starting at `character` on `line`. */
function markToken(l: Line, character: number, hat: InputHat): Token {
  const token = l.tokens.find((t) => t.range.start === character);
  assert.ok(token, `no token at character ${character}`);
  token.hat = hat;
  return token;
}

function countHatted(lines: Line[]): number {
  return lines.reduce(
    (n, l) => n + l.tokens.filter((t) => t.hat != null).length,
    0,
  );
}

function snapshot(lines: Line[]) {
  return lines.map((l) =>
    l.tokens.map((t) =>
      t.hat ? `${t.range.start}:${t.hat.color}/${t.hat.shape}` : "",
    ),
  );
}

suite("command-visualizer/hat-allocator", () => {
  suite("cssStateHatStyles", () => {
    test("keys pure colors and color-shape variants with penalty ordering", () => {
      const styles = cssStateHatStyles();
      // Pure color exists and is default-shape (bare key).
      assert.ok(styles.blue, "expected a bare 'blue' style");
      // Shaped variant exists and carries +1 penalty over its color.
      assert.ok(styles["blue-fox"], "expected a 'blue-fox' style");
      assert.equal(styles["blue-fox"].penalty, styles.blue.penalty + 1);
      // 'default' color has the lowest penalty.
      assert.equal(styles.default.penalty, 0);
    });
  });

  suite("allocateHats", () => {
    test("assigns at least one hat over a couple of words", () => {
      const lines = [line("value width")];
      allocateHats(lines);
      assert.ok(
        countHatted(lines) >= 1,
        "expected the real allocator to place at least one hat",
      );
    });

    test("hats land on real graphemes, with a valid palette style", () => {
      const lines = [line("alpha bravo")];
      allocateHats(lines);
      const styles = cssStateHatStyles();
      const validColors = new Set<string>(
        Object.keys(styles).map((k) => k.split("-")[0]),
      );
      for (const l of lines) {
        for (const t of l.tokens) {
          if (t.hat == null) {
            continue;
          }
          // A hatted token must be a non-whitespace grapheme.
          assert.ok(
            t.text.trim().length > 0,
            `hat landed on whitespace token "${t.text}"`,
          );
          // Its color must be a real palette color.
          assert.ok(
            validColors.has(t.hat.color),
            `hat color "${t.hat.color}" not in palette`,
          );
        }
      }
    });

    test("a pre-attached fixture-mark hat keeps its exact color", () => {
      // Two words; pin the first grapheme of "world" to a specific color, then
      // let the allocator fill the rest. The pinned mark must survive with the
      // same color it went in with.
      const l = line("hello world");
      const pinnedColor: HatColor = "yellow";
      // char index of "w"
      const worldStart = "hello ".length;
      const marked = markToken(l, worldStart, {
        color: pinnedColor,
        shape: "default",
      });

      allocateHats([l]);

      assert.ok(marked.hat, "pinned mark lost its hat entirely");
      assert.equal(
        marked.hat.color,
        pinnedColor,
        `pinned mark color changed from ${pinnedColor} to ${marked.hat.color}`,
      );
    });

    test("multiple pinned marks each keep their color across lines", () => {
      const l0 = line("red apple");
      const l1 = line("blue sky");
      const m0 = markToken(l0, 0, { color: "red", shape: "default" });
      const m1 = markToken(l1, 0, { color: "blue", shape: "default" });

      allocateHats([l0, l1]);

      assert.equal(m0.hat?.color, "red", "first pinned mark changed color");
      assert.equal(m1.hat?.color, "blue", "second pinned mark changed color");
    });

    test("is deterministic: same input yields the same assignment", () => {
      const build = () => [line("value width height")];
      const a = build();
      const b = build();
      allocateHats(a);
      allocateHats(b);

      assert.deepEqual(snapshot(a), snapshot(b));
    });

    test("empty document does not throw and hats nothing", () => {
      const lines = [line("")];
      allocateHats(lines);
      assert.equal(countHatted(lines), 0);
    });
  });
});
