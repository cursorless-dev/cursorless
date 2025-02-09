import type { SnippetMap } from "@cursorless/common";
import assert from "node:assert";
import type { SnippetFile } from "talon-snippets";
import { migrateLegacySnippet, type SpokenForms } from "./migrateSnippets";

interface Fixture {
  name: string;
  input: SnippetMap;
  output: SnippetFile;
}

const spokenForms: SpokenForms = {
  insertion: {
    mySnippet: "snip",
    myPythonSnippet: "snip py",
  },
  insertionWithPhrase: {
    myPhraseSnippet: "phrase",
  },
  wrapper: {
    "myWrapperSnippet.foo": "foo",
  },
};

const fixtures: Fixture[] = [
  {
    name: "Empty map",
    input: {},
    output: {
      snippets: [],
    },
  },
  {
    name: "Empty definitions",
    input: {
      mySnippet: {
        definitions: [],
      },
    },
    output: {
      header: {
        name: "mySnippet",
        phrases: ["snip"],
        description: undefined,
        insertionScopes: undefined,
        variables: [],
      },
      snippets: [],
    },
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
    output: {
      header: {
        name: "mySnippet",
        description: "Example description",
        phrases: ["snip"],
        insertionScopes: undefined,
        variables: [],
      },
      snippets: [
        {
          name: undefined,
          description: undefined,
          phrases: undefined,
          languages: ["plaintext"],
          insertionScopes: undefined,
          variables: [],
          body: ["Hello, $0, world!"],
        },
      ],
    },
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
    output: {
      header: {
        name: "myPhraseSnippet",
        description: "Example description",
        phrases: ["phrase"],
        insertionScopes: undefined,
        variables: [],
      },
      snippets: [
        {
          name: undefined,
          description: undefined,
          phrases: undefined,
          languages: ["plaintext"],
          insertionScopes: undefined,
          variables: [
            {
              name: "foo",
              insertionFormatters: ["SNAKE_CASE"],
              wrapperPhrases: undefined,
            },
          ],
          body: ["Hello, $foo, world!"],
        },
      ],
    },
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
    output: {
      header: {
        name: "myWrapperSnippet",
        description: undefined,
        phrases: undefined,
        insertionScopes: undefined,
        variables: [
          {
            name: "foo",
            wrapperPhrases: ["foo"],
          },
        ],
      },
      snippets: [
        {
          name: undefined,
          description: undefined,
          phrases: undefined,
          languages: ["plaintext"],
          insertionScopes: undefined,
          variables: [],
          body: ["Hello, $foo, world!"],
        },
      ],
    },
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
    output: {
      header: {
        name: "mySnippet",
        description: undefined,
        phrases: ["snip"],
        insertionScopes: undefined,
        variables: [],
      },
      snippets: [
        {
          name: undefined,
          description: undefined,
          phrases: undefined,
          languages: ["plaintext"],
          insertionScopes: undefined,
          variables: [],
          body: ["Hello, $0 plain world!"],
        },
        {
          name: undefined,
          description: undefined,
          phrases: undefined,
          languages: ["python"],
          insertionScopes: undefined,
          variables: [],
          body: ["Hello, $0 python world!"],
        },
      ],
    },
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
    output: {
      snippets: [
        {
          name: "mySnippet",
          description: undefined,
          phrases: ["snip"],
          languages: ["plaintext"],
          insertionScopes: undefined,
          variables: [],
          body: ["Hello, $0 plain world!"],
        },
        {
          name: "myPythonSnippet",
          description: undefined,
          phrases: ["snip py"],
          languages: ["python"],
          insertionScopes: undefined,
          variables: [],
          body: ["Hello, $0 python world!"],
        },
      ],
    },
  },
];

suite("Migrate snippets", async function () {
  fixtures.forEach((fixture) => {
    test(fixture.name, () => runTest(fixture.input, fixture.output));
  });
});

function runTest(input: SnippetMap, expectedOutput: SnippetFile) {
  const [actualOutput] = migrateLegacySnippet(spokenForms, input);

  assert.deepStrictEqual(actualOutput, expectedOutput);
}
