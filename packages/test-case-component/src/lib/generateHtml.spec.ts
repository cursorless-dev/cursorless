import prettier from "prettier";
import { generateHtml as unformettedFunc } from "./generateHtml";

async function generateHtml(...args: Parameters<typeof unformettedFunc>) {
  return prettier.format(await unformettedFunc(...args), {
    singleAttributePerLine: true,
    htmlWhitespaceSensitivity: "ignore",
    parser: "babel",
  });
}

describe("generateHtml", () => {
  it("should select whole line", async () => {
    expect(
      await generateHtml(
        {
          documentContents: "  const oneLine = 1;\nconst line2 = 2;",
          selections: [
            {
              type: "line",
              anchor: { line: 1, character: 0 },
              active: { line: 1, character: 22 },
            },
          ],
        },

        "typescript",
      ),
    ).toMatchInlineSnapshot(`
      "<pre
        class=\\"shiki\\"
        style=\\"background-color: var(--shiki-color-background)\\"
      >
        <code>
          <span class=\\"line\\">
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-keyword)\\">const</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-constant)\\">oneLine</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-keyword)\\">=</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-constant)\\">1</span>
            <span style=\\"color: var(--shiki-color-text)\\">;</span>
          </span>
          <span class=\\"line selection\\">
            <span style=\\"color: var(--shiki-token-keyword)\\">const</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-constant)\\">line2</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-keyword)\\">=</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-constant)\\">2</span>
            <span style=\\"color: var(--shiki-color-text)\\">;</span>
          </span>
        </code>
      </pre>;
      "
    `);
  });
  it("should select single token", async () => {
    expect(
      await generateHtml(
        {
          documentContents: "  const oneLine = 1;\nconst line2 = 2;",
          selections: [
            {
              type: "selection",
              anchor: { line: 0, character: 8 },
              active: { line: 0, character: 15 },
            },
          ],
        },

        "typescript",
      ),
    ).toMatchInlineSnapshot(`
      "<pre
        class=\\"shiki\\"
        style=\\"background-color: var(--shiki-color-background)\\"
      >
        <code>
          <span class=\\"line\\">
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-keyword)\\">const</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span
              className=\\"selection\\"
              style=\\"\\"
            >
              <span style=\\"color: var(--shiki-token-constant)\\">oneLine</span>
            </span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-keyword)\\">=</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-constant)\\">1</span>
            <span style=\\"color: var(--shiki-color-text)\\">;</span>
          </span>
          <span class=\\"line\\">
            <span style=\\"color: var(--shiki-token-keyword)\\">const</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-constant)\\">line2</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-keyword)\\">=</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-constant)\\">2</span>
            <span style=\\"color: var(--shiki-color-text)\\">;</span>
          </span>
        </code>
      </pre>;
      "
    `);
  });

  it("should select multiple tokens", async () => {
    expect(
      await generateHtml(
        {
          documentContents: "const oneLine = 1;",
          selections: [
            {
              type: "selection",
              anchor: { line: 0, character: 6 },
              active: { line: 0, character: 17 },
            },
          ],
        },

        "typescript",
      ),
    ).toMatchInlineSnapshot(`
      "<pre
        class=\\"shiki\\"
        style=\\"background-color: var(--shiki-color-background)\\"
      >
        <code>
          <span class=\\"line\\">
            <span style=\\"color: var(--shiki-token-keyword)\\">const</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span
              className=\\"selection\\"
              style=\\"\\"
            >
              <span style=\\"color: var(--shiki-token-constant)\\">oneLine</span>
              <span style=\\"color: var(--shiki-color-text)\\"> </span>
              <span style=\\"color: var(--shiki-token-keyword)\\">=</span>
              <span style=\\"color: var(--shiki-color-text)\\"> </span>
              <span style=\\"color: var(--shiki-token-constant)\\">1</span>
            </span>
            <span style=\\"color: var(--shiki-color-text)\\">;</span>
          </span>
        </code>
      </pre>;
      "
    `);
  });

  it("should select inside tokens", async () => {
    expect(
      await generateHtml(
        {
          documentContents: 'const oneLine = "line";',
          selections: [
            {
              type: "selection",
              anchor: { line: 0, character: 9 },
              active: { line: 0, character: 19 },
            },
          ],
        },

        "typescript",
      ),
    ).toMatchInlineSnapshot(`
      "<pre
        class=\\"shiki\\"
        style=\\"background-color: var(--shiki-color-background)\\"
      >
        <code>
          <span class=\\"line\\">
            <span style=\\"color: var(--shiki-token-keyword)\\">const</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-constant)\\">one</span>
            <span
              className=\\"selection\\"
              style=\\"\\"
            >
              <span style=\\"color: var(--shiki-token-constant)\\">Line</span>
              <span style=\\"color: var(--shiki-color-text)\\"> </span>
              <span style=\\"color: var(--shiki-token-keyword)\\">=</span>
              <span style=\\"color: var(--shiki-color-text)\\"> </span>
              <span style=\\"color: var(--shiki-token-string-expression)\\">
                &quot;li
              </span>
            </span>
            <span style=\\"color: var(--shiki-token-string-expression)\\">ne&quot;</span>
            <span style=\\"color: var(--shiki-color-text)\\">;</span>
          </span>
        </code>
      </pre>;
      "
    `);
  });

  it("should select inside single token", async () => {
    expect(
      await generateHtml(
        {
          documentContents: "const oneLine = 1;",
          selections: [
            {
              type: "selection",
              anchor: { line: 0, character: 9 },
              active: { line: 0, character: 11 },
            },
          ],
        },

        "typescript",
      ),
    ).toMatchInlineSnapshot(`
      "<pre
        class=\\"shiki\\"
        style=\\"background-color: var(--shiki-color-background)\\"
      >
        <code>
          <span class=\\"line\\">
            <span style=\\"color: var(--shiki-token-keyword)\\">const</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-constant)\\">one</span>
            <span
              className=\\"selection\\"
              style=\\"\\"
            >
              <span style=\\"color: var(--shiki-token-constant)\\">Li</span>
            </span>
            <span style=\\"color: var(--shiki-token-constant)\\">ne</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-keyword)\\">=</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-constant)\\">1</span>
            <span style=\\"color: var(--shiki-color-text)\\">;</span>
          </span>
        </code>
      </pre>;
      "
    `);
  });
  it("should select superset ranges", async () => {
    expect(
      await generateHtml(
        {
          documentContents: "const oneLine = 1;",
          selections: [
            {
              type: "selection",
              anchor: { line: 0, character: 9 },
              active: { line: 0, character: 11 },
            },
          ],
          thatMark: [
            {
              type: "selection",
              anchor: { line: 0, character: 6 },
              active: { line: 0, character: 13 },
            },
          ],
        },

        "typescript",
      ),
    ).toMatchInlineSnapshot(`
      "<pre
        class=\\"shiki\\"
        style=\\"background-color: var(--shiki-color-background)\\"
      >
        <code>
          <span class=\\"line\\">
            <span style=\\"color: var(--shiki-token-keyword)\\">const</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span
              className=\\"thatMark\\"
              style=\\"\\"
            >
              <span style=\\"color: var(--shiki-token-constant)\\">one</span>
            </span>
            <span
              className=\\"thatMark selection\\"
              style=\\"\\"
            >
              <span style=\\"color: var(--shiki-token-constant)\\">Li</span>
            </span>
            <span
              className=\\"thatMark\\"
              style=\\"\\"
            >
              <span style=\\"color: var(--shiki-token-constant)\\">ne</span>
            </span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-keyword)\\">=</span>
            <span style=\\"color: var(--shiki-color-text)\\"> </span>
            <span style=\\"color: var(--shiki-token-constant)\\">1</span>
            <span style=\\"color: var(--shiki-color-text)\\">;</span>
          </span>
        </code>
      </pre>;
      "
    `);
  });
});
