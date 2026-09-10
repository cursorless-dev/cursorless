import assert from "node:assert/strict";
import {
  asyncSafety,
  FakeIDE,
  InMemoryTextEditor,
  Position,
} from "@cursorless/lib-common";
import { TestTreeSitter } from "../../testUtil/TestTreeSitter";
import { expandCaptureName } from "./captureAliases";
import { TreeSitterQuery } from "./TreeSitterQuery";
import { treeSitterQueryCache } from "./TreeSitterQueryCache";

for (const alias of [
  "statementNameValue.iteration",
  "statementNameValueType.iteration",
]) {
  suite(`${alias} capture alias`, () => {
    const ide = new FakeIDE();
    const treeSitter = new TestTreeSitter();
    const names = [
      "statement.iteration",
      "name.iteration",
      "value.iteration",
      ...(alias === "statementNameValueType.iteration"
        ? ["type.iteration"]
        : []),
    ];

    suiteSetup(
      asyncSafety(async () => {
        await treeSitter.loadLanguage("shellscript");
      }),
    );

    setup(() => treeSitterQueryCache.clear());

    test("preserves suffixes and leaves unrelated names unchanged", () => {
      for (const suffix of [
        "",
        ".start.endOf",
        ".end.startOf",
        ".end.endOf",
        ".domain",
      ]) {
        assert.deepEqual(
          expandCaptureName(`${alias}${suffix}`),
          names.map((name) => `${name}${suffix}`),
        );
      }
      assert.deepEqual(expandCaptureName("interior"), ["interior"]);
      assert.deepEqual(expandCaptureName(`${alias}Other`), [`${alias}Other`]);
    });

    for (const withPredicates of [false, true]) {
      test(`expands and filters boundary captures with predicates: ${withPredicates}`, () => {
        const { query, document } = createQuery(`
          ((compound_statement
            "{" @${alias}.start.endOf
            "}" @${alias}.end.startOf
          ) ${withPredicates ? `(#type? @${alias}.start.endOf "{")` : ""})
        `);
        for (const name of names) {
          assert.equal(query.hasCapture(name), true);
        }
        assert.equal(query.hasCapture(alias), false);
        assert.equal(query.hasCapture("interior"), false);
        assert.equal(
          query.hasCapture("type.iteration"),
          names.includes("type.iteration"),
        );

        const matches = query.matches(
          document,
          new Position(0, 0),
          new Position(0, 15),
        );
        assert.equal(matches.length, 1);
        assert.deepEqual(
          matches[0].captures.map((c) => c.name),
          names,
        );
        for (const capture of matches[0].captures) {
          assert.equal(document.getText(capture.range), " bar=0; ");
        }

        for (const scope of [
          "statement",
          "name",
          "value",
          ...(alias === "statementNameValueType.iteration"
            ? ["type" as const]
            : []),
        ] as const) {
          const filtered = query.matchesForScopeTypes(document, [scope]);
          assert.equal(filtered.length, 1);
          assert.equal(filtered[0].captures.length, 1);
          assert.equal(filtered[0].captures[0].name, `${scope}.iteration`);
          assert.equal(
            document.getText(filtered[0].captures[0].range),
            " bar=0; ",
          );
        }
        assert.deepEqual(query.matchesForScopeTypes(document, ["comment"]), []);
      });
    }

    test("supports an inclusive end boundary on the containing node", () => {
      const { query, document } = createQuery(`
        (compound_statement
          "{" @${alias}.start.endOf
        ) @${alias}.end.endOf
      `);
      const matches = query.matchesForScopeTypes(document, [
        "statement",
        "name",
        "value",
        "type",
      ]);
      assert.equal(matches.length, 1);
      assert.deepEqual(
        matches[0].captures.map((capture) => capture.name),
        names,
      );
      for (const capture of matches[0].captures) {
        assert.equal(document.getText(capture.range), " bar=0; }");
      }
    });

    test("shares capture slots with ordinary captures", () => {
      const { query, document } = createQuery(`
        (compound_statement
          "{" @${alias}.start.endOf @branch.start @branch.removal.start
          "}" @${alias}.end.startOf @branch.end @branch.removal.end)
      `);
      const matches = query.matches(
        document,
        new Position(0, 0),
        new Position(0, 15),
      );
      assert.equal(matches.length, 1);
      assert.deepEqual(
        matches[0].captures.map((capture) => capture.name),
        [...names, "branch", "branch.removal"],
      );
      const branches = query.matchesForScopeTypes(document, ["branch"]);
      assert.equal(branches[0].captures.length, 2);
      for (const capture of branches[0].captures) {
        assert.equal(document.getText(capture.range), "{ bar=0; }");
      }
    });

    test("propagates predicate range and metadata changes to every alias target", () => {
      const { query, document } = createQuery(`
        ((compound_statement) @${alias}
          (#shrink-to-match! @${alias} "[{](?<keep>[^}]*)[}]")
          (#insertion-delimiter! @${alias} ", ")
          (#allow-multiple! @${alias}))
      `);
      const matches = query.matchesForScopeTypes(document, [
        "statement",
        "name",
        "value",
        "type",
      ]);
      assert.equal(matches.length, 1);
      assert.equal(matches[0].captures.length, names.length);
      for (const capture of matches[0].captures) {
        assert.equal(document.getText(capture.range), " bar=0; ");
        assert.equal(capture.insertionDelimiter, ", ");
        assert.equal(capture.allowMultiple, true);
      }
    });

    test("rejecting a predicate discards every expanded capture", () => {
      const { query, document } = createQuery(`
        ((compound_statement) @${alias}
          (#not-type? @${alias} compound_statement))
      `);
      assert.deepEqual(query.matchesForScopeTypes(document, ["statement"]), []);
    });

    function createQuery(source: string) {
      const editor = new InMemoryTextEditor({
        ide,
        languageId: "shellscript",
        content: "foo() { bar=0; }",
      });
      const rawQuery = treeSitter.createQuery("shellscript", source);
      assert.ok(rawQuery);
      return {
        document: editor.document,
        query: TreeSitterQuery.create(ide, "shellscript", treeSitter, rawQuery),
      };
    }
  });
}
