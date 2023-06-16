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
    name: "should prefer snippets based on specificity",
    coreSnippets: {
      aaa: {
        definitions: [
          {
            body: [""],
          },
          {
            body: [""],
            scope: {
              langIds: ["typescript"],
            },
          },
          {
            body: [""],
            scope: {
              langIds: ["typescript", "javascript"],
            },
          },
          {
            body: [""],
            scope: {
              scopeTypes: ["anonymousFunction"],
            },
          },
          {
            body: [""],
            scope: {
              langIds: ["typescript"],
              scopeTypes: ["anonymousFunction"],
            },
          },
          {
            body: [""],
            scope: {
              langIds: ["typescript", "javascript"],
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
            body: [""],
            scope: {
              langIds: ["typescript"],
              scopeTypes: ["anonymousFunction"],
            },
          },
          {
            body: [""],
            scope: {
              langIds: ["typescript", "javascript"],
              scopeTypes: ["anonymousFunction"],
            },
          },
          {
            body: [""],
            scope: {
              langIds: ["typescript"],
            },
          },
          {
            body: [""],
            scope: {
              langIds: ["typescript", "javascript"],
            },
          },
          {
            body: [""],
            scope: {
              scopeTypes: ["anonymousFunction"],
            },
          },
          {
            body: [""],
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
