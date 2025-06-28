import type { SnippetMap } from "@cursorless/common";
import assert from "node:assert";
import { serializeSnippetFile } from "talon-snippets";
import { migrateLegacySnippet, type SpokenForms } from "./migrateSnippets";

interface Fixture {
  name: string;
  input: SnippetMap;
  output: string;
}

const spokenForms: SpokenForms = {
  insertion: {
    mySnippet: "snip",
    myPythonSnippet: "snip py",
  },
  insertionWithPhrase: {
    "myPhraseSnippet.foo": "phrase",
  },
  wrapper: {
    "myWrapperSnippet.foo": "foo",
  },
};

const fixtures: Fixture[] = [
  {
    name: "Empty map",
    input: {},
    output: "",
  },

  {
    name: "Empty definitions",
    input: {
      mySnippet: {
        definitions: [],
      },
    },
    output: `\
name: mySnippet
phrase: snip
---
`,
  },

  {
    name: "Basic",
    input: {
      mySnippet: {
        description: "Example description",
        definitions: [
          {
            scope: { langIds: ["plaintext"] },
            body: ["Hello, $0, world!"],
          },
        ],
      },
    },
    output: `\
name: mySnippet
description: Example description
phrase: snip
---

language: plaintext
-
Hello, $0, world!
---
`,
  },

  {
    name: "Insertion phrase",
    input: {
      myPhraseSnippet: {
        description: "Example description",
        definitions: [
          {
            scope: { langIds: ["plaintext"] },
            body: ["Hello, $foo, world!"],
            variables: {
              foo: { formatter: "snakeCase" },
            },
          },
        ],
      },
    },
    output: `\
name: myPhraseSnippet
description: Example description
phrase: phrase
---

language: plaintext

$foo.insertionFormatter: SNAKE_CASE
-
Hello, $foo, world!
---
`,
  },

  {
    name: "Insertion phrase noop",
    input: {
      myPhraseSnippet: {
        description: "Example description",
        definitions: [
          {
            scope: { langIds: ["plaintext"] },
            body: ["Hello, $foo, world!"],
          },
        ],
      },
    },
    output: `\
name: myPhraseSnippet
description: Example description
phrase: phrase
---

language: plaintext

$foo.insertionFormatter: NOOP
-
Hello, $foo, world!
---
`,
  },

  {
    name: "Wrapper phrase",
    input: {
      myWrapperSnippet: {
        definitions: [
          {
            scope: { langIds: ["plaintext"] },
            body: ["Hello, $foo, world!"],
          },
        ],
      },
    },
    output: `\
name: myWrapperSnippet

$foo.wrapperPhrase: foo
---

language: plaintext
-
Hello, $foo, world!
---
`,
  },

  {
    name: "Multiple definitions",
    input: {
      mySnippet: {
        definitions: [
          {
            scope: { langIds: ["plaintext"] },
            body: ["Hello, $0 plain world!"],
          },
          {
            scope: { langIds: ["python"] },
            body: ["Hello, $0 python world!"],
          },
        ],
      },
    },
    output: `\
name: mySnippet
phrase: snip
---

language: plaintext
-
Hello, $0 plain world!
---

language: python
-
Hello, $0 python world!
---
`,
  },

  {
    name: "Multiple snippets",
    input: {
      mySnippet: {
        definitions: [
          {
            scope: { langIds: ["plaintext"] },
            body: ["Hello, $0 plain world!"],
          },
        ],
      },
      myPythonSnippet: {
        definitions: [
          {
            scope: { langIds: ["python"] },
            body: ["Hello, $0 python world!"],
          },
        ],
      },
    },
    output: `\
name: mySnippet
language: plaintext
phrase: snip
-
Hello, $0 plain world!
---

name: myPythonSnippet
language: python
phrase: snip py
-
Hello, $0 python world!
---
`,
  },
];

suite("Migrate snippets", async function () {
  fixtures.forEach((fixture) => {
    test(fixture.name, () => runTest(fixture.input, fixture.output));
  });
});

function runTest(input: SnippetMap, expectedOutput: string) {
  const [snippetFile] = migrateLegacySnippet(spokenForms, input);
  const actualOutput = serializeSnippetFile(snippetFile);

  assert.equal(actualOutput, expectedOutput);
}
