import assert from "node:assert/strict";
import { captionHtml, esc, themeBackground } from "./html";

suite("command-visualizer/html", () => {
  suite("esc", () => {
    test("escapes all five HTML-significant characters", () => {
      assert.equal(esc("&"), "&amp;");
      assert.equal(esc("<"), "&lt;");
      assert.equal(esc(">"), "&gt;");
      assert.equal(esc('"'), "&quot;");
      assert.equal(esc("'"), "&#39;");
    });

    test("escapes & first so entities are not double-escaped", () => {
      // If & were escaped after <, "<" -> "&lt;" -> "&amp;lt;" (wrong).
      assert.equal(esc("<&>"), "&lt;&amp;&gt;");
    });

    test("neutralizes an attribute-breakout payload (CodeQL regression)", () => {
      const payload = 'x" onmouseover="alert(1)';
      const escaped = esc(payload);
      assert.ok(!escaped.includes('"'), "no raw double-quote survives");
      assert.equal(escaped, "x&quot; onmouseover=&quot;alert(1)");
    });

    test("leaves ordinary text untouched", () => {
      assert.equal(esc("changeToken hello 42"), "changeToken hello 42");
    });
  });

  suite("themeBackground", () => {
    test("maps dark and light to their page backgrounds", () => {
      assert.equal(themeBackground("dark"), "#141414");
      assert.equal(themeBackground("light"), "#e8e8e8");
    });
  });

  suite("captionHtml", () => {
    test("returns empty string when there is no meta", () => {
      assert.equal(captionHtml(undefined), "");
    });

    test("joins spoken form, action and fixture with a middot separator", () => {
      const html = captionHtml({
        spokenForm: "change token",
        action: "clearAndSetSelection",
        fixture: "recorded/changeToken.yml",
      });
      assert.equal(
        html,
        '<div class="cl-caption">&quot;change token&quot;  ·  ' +
          "clearAndSetSelection  ·  recorded/changeToken.yml</div>",
      );
    });

    test("omits absent fields rather than emitting empty segments", () => {
      assert.equal(
        captionHtml({ action: "remove" }),
        '<div class="cl-caption">remove</div>',
      );
    });

    test("escapes meta content so it cannot inject markup", () => {
      const html = captionHtml({ fixture: "<script>alert(1)</script>" });
      assert.ok(!html.includes("<script>"));
      assert.ok(html.includes("&lt;script&gt;"));
    });
  });
});
