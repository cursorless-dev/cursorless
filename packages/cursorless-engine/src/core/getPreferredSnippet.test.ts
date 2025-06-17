import type {
  CustomInsertSnippetArg,
  CustomWrapWithSnippetArg,
  ListInsertSnippetArg,
  ListWrapWithSnippetArg,
  NamedInsertSnippetArg,
  NamedWrapWithSnippetArg,
} from "@cursorless/common";
import assert from "node:assert";
import { getPreferredSnippet } from "./getPreferredSnippet";

const insertNamed: NamedInsertSnippetArg = {
  type: "named",
  name: "named snippet",
};

const insertSingleLanguage: CustomInsertSnippetArg = {
  type: "custom",
  body: "custom body",
  languages: ["a"],
};

const insertMultiLanguage: CustomInsertSnippetArg = {
  type: "custom",
  body: "custom body",
  languages: ["a", "b"],
};

const insertGlobal: CustomInsertSnippetArg = {
  type: "custom",
  body: "custom body",
};

const insertionSnippets = [
  insertGlobal,
  insertMultiLanguage,
  insertSingleLanguage,
];

const wrapNamed: NamedWrapWithSnippetArg = {
  type: "named",
  name: "named wrap snippet",
  variableName: "var",
};

const wrapSingleLanguage: CustomWrapWithSnippetArg = {
  type: "custom",
  body: "custom body",
  variableName: "var",
  languages: ["a"],
};

const wrapMultiLanguage: CustomWrapWithSnippetArg = {
  type: "custom",
  body: "custom body",
  variableName: "var",
  languages: ["a", "b"],
};

const wrapGlobal: CustomWrapWithSnippetArg = {
  type: "custom",
  body: "custom body",
  variableName: "var",
};

const wrapSnippets = [wrapGlobal, wrapMultiLanguage, wrapSingleLanguage];

suite("getPreferredSnippet", () => {
  test("Insert named", () => {
    assert.throws(() => {
      getPreferredSnippet(insertNamed, "a");
    });
  });

  test("Insert single language", () => {
    const snippet: ListInsertSnippetArg = {
      type: "list",
      snippets: insertionSnippets,
    };
    const preferred = getPreferredSnippet(snippet, "a");
    assert.equal(preferred, insertSingleLanguage);
  });

  test("Insert multi language", () => {
    const snippet: ListInsertSnippetArg = {
      type: "list",
      snippets: insertionSnippets,
    };
    const preferred = getPreferredSnippet(snippet, "b");
    assert.equal(preferred, insertMultiLanguage);
  });

  test("Insert fallback single language", () => {
    const snippet: ListInsertSnippetArg = {
      type: "list",
      fallbackLanguage: "a",
      snippets: insertionSnippets,
    };
    const preferred = getPreferredSnippet(snippet, "c");
    assert.equal(preferred, insertSingleLanguage);
  });

  test("Insert fallback multi language", () => {
    const snippet: ListInsertSnippetArg = {
      type: "list",
      fallbackLanguage: "b",
      snippets: insertionSnippets,
    };
    const preferred = getPreferredSnippet(snippet, "c");
    assert.equal(preferred, insertMultiLanguage);
  });

  test("Insert global", () => {
    const snippet: ListInsertSnippetArg = {
      type: "list",
      snippets: insertionSnippets,
    };
    const preferred = getPreferredSnippet(snippet, "c");
    assert.equal(preferred, insertGlobal);
  });

  test("Wrap named", () => {
    assert.throws(() => {
      getPreferredSnippet(wrapNamed, "a");
    });
  });

  test("Wrap single language", () => {
    const snippet: ListWrapWithSnippetArg = {
      type: "list",
      snippets: wrapSnippets,
    };
    const preferred = getPreferredSnippet(snippet, "a");
    assert.equal(preferred, wrapSingleLanguage);
  });

  test("Wrap multi language", () => {
    const snippet: ListWrapWithSnippetArg = {
      type: "list",
      snippets: wrapSnippets,
    };
    const preferred = getPreferredSnippet(snippet, "b");
    assert.equal(preferred, wrapMultiLanguage);
  });

  test("Wrap fallback single language", () => {
    const snippet: ListWrapWithSnippetArg = {
      type: "list",
      fallbackLanguage: "a",
      snippets: wrapSnippets,
    };
    const preferred = getPreferredSnippet(snippet, "c");
    assert.equal(preferred, wrapSingleLanguage);
  });

  test("Wrap fallback multi language", () => {
    const snippet: ListWrapWithSnippetArg = {
      type: "list",
      fallbackLanguage: "b",
      snippets: wrapSnippets,
    };
    const preferred = getPreferredSnippet(snippet, "c");
    assert.equal(preferred, wrapMultiLanguage);
  });

  test("Wrap global", () => {
    const snippet: ListWrapWithSnippetArg = {
      type: "list",
      snippets: wrapSnippets,
    };
    const preferred = getPreferredSnippet(snippet, "c");
    assert.equal(preferred, wrapGlobal);
  });
});
