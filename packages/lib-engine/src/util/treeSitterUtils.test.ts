import assert from "node:assert/strict";
import { mock } from "node:test";
import type { Tree, TreeCursor } from "web-tree-sitter";
import { Node } from "web-tree-sitter";
import { FakeIDE, InMemoryTextEditor } from "@cursorless/lib-common";
import { getChildNodesForFieldName } from "../languages/TreeSitterQuery/getChildNodesForFieldName";
import { isEven } from "../languages/TreeSitterQuery/isEven";
import { TestTreeSitter } from "../testUtil/TestTreeSitter";
import { getChildNodesForFieldName as getChildren } from "./treeSitterUtils";

suite("Tree-sitter cursor lifetime", () => {
  const treeSitter = new TestTreeSitter();
  let tree: Tree;
  const deletions: {
    cursor: TreeCursor;
    deletion: ReturnType<typeof mock.method>;
  }[] = [];

  suiteSetup(async () => {
    await treeSitter.loadLanguage("clojure");
  });

  setup(() => {
    const { document } = new InMemoryTextEditor({
      ide: new FakeIDE(),
      content: "{:a 1 :b 2}",
      languageId: "clojure",
    });
    tree = treeSitter.getTree(document);
    const walk = Node.prototype.walk;
    mock.method(Node.prototype, "walk", function (this: Node) {
      const cursor = walk.call(this);
      deletions.push({ cursor, deletion: mock.method(cursor, "delete") });
      return cursor;
    });
  });

  teardown(() => {
    try {
      assert.ok(deletions.length > 0, "Expected traversal to create a cursor");
      for (const { deletion } of deletions) {
        assert.equal(deletion.mock.callCount(), 1);
      }
    } finally {
      // Also clean up cursors if a regression leaves them unfreed. Their WASM
      // finalizers can crash the process, obscuring the assertion failure.
      for (const { cursor, deletion } of deletions) {
        if (deletion.mock.callCount() === 0) {
          cursor.delete();
        }
      }
      deletions.length = 0;
      mock.restoreAll();
      tree.delete();
    }
  });

  test("releases the cursor on an early return from isEven", () => {
    const node = tree.rootNode.descendantsOfType("kwd_lit")[0];
    assert.equal(isEven(node, "value"), true);
  });

  test("releases the cursor when isEven throws for a missing field", () => {
    const node = tree.rootNode.descendantsOfType("kwd_lit")[0];
    assert.throws(() => isEven(node, "missing"), /Node not found in parent/u);
  });

  for (const [name, getNodes] of [
    ["query", getChildNodesForFieldName],
    ["utility", getChildren],
  ] as const) {
    test(`${name} traversal releases the cursor after collecting children`, () => {
      const node = tree.rootNode.descendantsOfType("map_lit")[0];
      assert.deepEqual(
        getNodes(node, "value").map((child) => child.text),
        [":a", "1", ":b", "2"],
      );
    });

    test(`${name} traversal releases the cursor for a leaf`, () => {
      const node = tree.rootNode.descendantsOfType("num_lit")[0];
      assert.deepEqual(getNodes(node, "value"), []);
    });
  }
});
