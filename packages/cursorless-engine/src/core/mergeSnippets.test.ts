import { SnippetMap } from "@cursorless/common";
import { mergeSnippets } from "./mergeSnippets";
import assert = require("assert");

interface TestCase {
  name: string;
  coreSnippets?: SnippetMap;
  thirdPartySnippets?: Record<string, SnippetMap>;
  userSnippets?: SnippetMap[];
  expected: SnippetMap;
}

const testCases: TestCase[] = [
  {
    name: "should handle simple case",
    coreSnippets: {
      aaa: {
        definitions: [
          {
            body: ["aaa"],
          },
        ],
      },
    },
    thirdPartySnippets: {
      someThirdParty: {
        bbb: {
          definitions: [
            {
              body: ["bbb"],
            },
          ],
        },
      },
    },
    userSnippets: [
      {
        ccc: {
          definitions: [
            {
              body: ["ccc"],
            },
          ],
        },
      },
    ],
    expected: {
      aaa: {
        definitions: [
          {
            body: ["aaa"],
          },
        ],
      },
      bbb: {
        definitions: [
          {
            body: ["bbb"],
          },
        ],
      },
      ccc: {
        definitions: [
          {
            body: ["ccc"],
          },
        ],
      },
    },
  },

  {
    name: "should prefer user snippets",
    coreSnippets: {
      aaa: {
        definitions: [
          {
            body: ["core aaa"],
          },
        ],
        description: "core snippet",
      },
    },
    thirdPartySnippets: {
      someThirdParty: {
        aaa: {
          definitions: [
            {
              body: ["someThirdParty aaa"],
            },
          ],
          description: "someThirdParty snippet",
        },
      },
    },
    userSnippets: [
      {
        aaa: {
          definitions: [
            {
              body: ["user aaa"],
            },
          ],
          description: "user snippet",
        },
      },
    ],
    expected: {
      aaa: {
        definitions: [
          {
            body: ["user aaa"],
          },
          {
            body: ["someThirdParty aaa"],
          },
          {
            body: ["core aaa"],
          },
        ],
        description: "user snippet",
      },
    },
  },

  {
    name: "should prefer user snippets when scopes are the same",
    coreSnippets: {
      aaa: {
        definitions: [
          {
            body: ["core aaa"],
            scope: {
              langIds: ["typescript"],
              scopeTypes: ["anonymousFunction"],
            },
          },
        ],
        description: "core snippet",
      },
    },
    thirdPartySnippets: {
      someThirdParty: {
        aaa: {
          definitions: [
            {
              body: ["someThirdParty aaa"],
              scope: {
                langIds: ["typescript"],
                scopeTypes: ["anonymousFunction"],
              },
            },
          ],
          description: "someThirdParty snippet",
        },
      },
    },
    userSnippets: [
      {
        aaa: {
          definitions: [
            {
              body: ["user aaa"],
              scope: {
                langIds: ["typescript"],
                scopeTypes: ["anonymousFunction"],
              },
            },
          ],
          description: "user snippet",
        },
      },
    ],
    expected: {
      aaa: {
        definitions: [
          {
            body: ["user aaa"],
            scope: {
              langIds: ["typescript"],
              scopeTypes: ["anonymousFunction"],
            },
          },
          {
            body: ["someThirdParty aaa"],
            scope: {
              langIds: ["typescript"],
              scopeTypes: ["anonymousFunction"],
            },
          },
          {
            body: ["core aaa"],
            scope: {
              langIds: ["typescript"],
              scopeTypes: ["anonymousFunction"],
            },
          },
        ],
        description: "user snippet",
      },
    },
  },

  {
    name: "should prefer more specific snippets, even if they are from a lower priority origin",
    coreSnippets: {
      aaa: {
        definitions: [
          {
            body: ["core aaa"],
            scope: {
              langIds: ["typescript"],
            },
          },
        ],
        description: "core snippet",
      },
    },
    userSnippets: [
      {
        aaa: {
          definitions: [
            {
              body: ["user aaa"],
            },
          ],
          description: "user snippet",
        },
      },
    ],
    expected: {
      aaa: {
        definitions: [
          {
            body: ["core aaa"],
            scope: {
              langIds: ["typescript"],
            },
          },
          {
            body: ["user aaa"],
          },
        ],
        description: "user snippet",
      },
    },
  },

  {
    name: "should prefer snippets with more specific languages",
    coreSnippets: {
      aaa: {
        definitions: [
          {
            body: ["has no langIds"],
          },
          {
            body: ["has two langIds"],
            scope: {
              langIds: ["typescript", "javascript"],
            },
          },
          {
            body: ["has one langId"],
            scope: {
              langIds: ["typescript"],
            },
          },
        ],
      },
    },
    expected: {
      aaa: {
        definitions: [
          {
            body: ["has one langId"],
            scope: {
              langIds: ["typescript"],
            },
          },
          {
            body: ["has two langIds"],
            scope: {
              langIds: ["typescript", "javascript"],
            },
          },
          {
            body: ["has no langIds"],
          },
        ],
      },
    },
  },

  {
    name: "should prefer snippets with more specific languages, regardless of scopeType",
    coreSnippets: {
      aaa: {
        definitions: [
          {
            body: ["has scope but no langIds"],
            scope: {
              scopeTypes: ["anonymousFunction"],
            },
          },
          {
            body: ["has langIds"],
            scope: {
              langIds: ["typescript"],
            },
          },
        ],
      },
    },
    expected: {
      aaa: {
        definitions: [
          {
            body: ["has langIds"],
            scope: {
              langIds: ["typescript"],
            },
          },
          {
            body: ["has scope but no langIds"],
            scope: {
              scopeTypes: ["anonymousFunction"],
            },
          },
        ],
      },
    },
  },

  {
    name: "should prefer snippets with more specific scope types",
    coreSnippets: {
      aaa: {
        definitions: [
          {
            body: ["has no scopeType"],
            scope: {
              langIds: ["typescript"],
            },
          },
          {
            body: ["has scopeType"],
            scope: {
              langIds: ["typescript"],
              scopeTypes: ["anonymousFunction"],
            },
          },
        ],
      },
    },
    expected: {
      aaa: {
        definitions: [
          {
            body: ["has scopeType"],
            scope: {
              langIds: ["typescript"],
              scopeTypes: ["anonymousFunction"],
            },
          },
          {
            body: ["has no scopeType"],
            scope: {
              langIds: ["typescript"],
            },
          },
        ],
      },
    },
  },
];

suite("mergeSnippets", function () {
  for (const testCase of testCases) {
    test(testCase.name, function () {
      const actual = mergeSnippets(
        testCase.coreSnippets ?? {},
        testCase.thirdPartySnippets ?? {},
        testCase.userSnippets ?? [],
      );

      assert.deepStrictEqual(actual, testCase.expected);
    });
  }
});
