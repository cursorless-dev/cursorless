import assert from "node:assert/strict";
import type { PredicateStep, Tree } from "web-tree-sitter";
import { FakeIDE, InMemoryTextEditor, Range } from "@cursorless/lib-common";
import { TestTreeSitter } from "../../testUtil/TestTreeSitter";
import type { MutableQueryCapture } from "./QueryCapture";
import { queryPredicateOperators } from "./queryPredicateOperators";

type OperatorName = (typeof queryPredicateOperators)[number]["name"];
type Operand = MutableQueryCapture | string | number | boolean;

suite("queryPredicateOperators", () => {
  const treeSitter = new TestTreeSitter();
  const trees: Tree[] = [];
  let nextCaptureId = 0;

  suiteSetup(async () => {
    await treeSitter.loadLanguage("python");
    await treeSitter.loadLanguage("clojure");
  });

  teardown(() => {
    for (const tree of trees) {
      tree.delete();
    }
    trees.length = 0;
  });

  function fixture(text: string, languageId = "python") {
    const { document } = new InMemoryTextEditor({
      ide: new FakeIDE(),
      content: text,
      languageId,
    });
    const tree = treeSitter.getTree(document);
    trees.push(tree);
    assert.equal(tree.rootNode.hasError, false);

    function capture(node = tree.rootNode): MutableQueryCapture {
      return {
        name: `capture${nextCaptureId++}`,
        node,
        document,
        range: new Range(
          document.positionAt(node.startIndex),
          document.positionAt(node.endIndex),
        ),
        allowMultiple: false,
        insertionDelimiter: undefined,
        hasError: () => node.hasError,
      };
    }

    function find(type: string, nodeText?: string) {
      const node = tree.rootNode
        .descendantsOfType(type)
        .find((node) => nodeText == null || node.text === nodeText);
      assert.ok(node, `Missing ${type} node ${nodeText ?? ""}`);
      return capture(node);
    }

    return { capture, find, document };
  }

  for (const name of ["even?", "odd?"] as const) {
    suite(name, () => {
      test("counts only siblings in the requested field, starting at zero", () => {
        const { find } = fixture("{:a 1 :b 2}", "clojure");
        for (const [index, text] of [":a", "1", ":b", "2"].entries()) {
          const capture = find(index % 2 === 0 ? "kwd_lit" : "num_lit", text);
          assert.equal(
            run(name, capture, "value"),
            index % 2 === (name === "even?" ? 0 : 1),
          );
        }
      });

      test("rejects a missing parent or field", () => {
        const { capture, find } = fixture("x");
        assert.throws(
          () => run(name, capture(), "value"),
          /Node has no parent/u,
        );
        assert.throws(
          () => run(name, find("identifier"), "missing"),
          /Node not found in parent for field: missing/u,
        );
      });
    });
  }

  for (const name of ["text?", "type?", "not-type?"] as const) {
    test(`${name} matches any supplied alternative exactly`, () => {
      const capture = fixture("hello").find("identifier");
      const match = name === "text?" ? "hello" : "identifier";
      const expected = name !== "not-type?";
      assert.equal(run(name, capture, match), expected);
      assert.equal(run(name, capture, "missing", match), expected);
      assert.equal(run(name, capture, "missing", "other"), !expected);
      assert.equal(run(name, capture, match.toUpperCase()), !expected);
      assert.equal(run(name, capture, match.slice(1)), !expected);
    });
  }

  test("not-parent-type? checks all alternatives and accepts the root", () => {
    const { capture, find } = fixture("hello");
    assert.equal(
      run("not-parent-type?", find("identifier"), "identifier"),
      true,
    );
    assert.equal(
      run(
        "not-parent-type?",
        find("identifier"),
        "missing",
        "expression_statement",
      ),
      false,
    );
    assert.equal(run("not-parent-type?", capture(), "module"), true);
  });

  test("not-child-type? checks direct named and anonymous children, not descendants", () => {
    const { find } = fixture("f(a)");
    assert.equal(
      run("not-child-type?", find("argument_list"), "missing", "identifier"),
      false,
    );
    assert.equal(run("not-child-type?", find("argument_list"), "("), false);
    assert.equal(run("not-child-type?", find("call"), "("), true);
    assert.equal(
      run("not-child-type?", find("identifier", "a"), "identifier"),
      true,
    );
  });

  test("is-nth-child? uses zero-based indexes including anonymous children", () => {
    const { capture, find } = fixture("f(a, b)");
    assert.equal(run("is-nth-child?", find("identifier", "a"), 1), true);
    assert.equal(run("is-nth-child?", find("identifier", "a"), 0), false);
    assert.equal(run("is-nth-child?", find("identifier", "b"), 3), true);
    assert.equal(run("is-nth-child?", find("identifier", "a"), -1), false);
    assert.equal(run("is-nth-child?", find("identifier", "a"), 99), false);
    assert.equal(run("is-nth-child?", capture(), 0), false);
  });

  for (const [text, expected] of [
    ["f()", false],
    ["f(a)", false],
    ["f(a, b)", true],
    ["f(a, b, c)", true],
  ] as const) {
    test(`has-multiple-children-of-type? with ${text}`, () => {
      const capture = fixture(text).find("argument_list");
      assert.equal(
        run("has-multiple-children-of-type?", capture, "identifier"),
        expected,
      );
      assert.equal(
        run("has-multiple-children-of-type?", capture, "missing"),
        false,
      );
    });
  }

  suite("child-range!", () => {
    const cases: [string, Operand[], string][] = [
      ["default end", [1], "0:2-0:7"],
      ["explicit end", [1, 3], "0:2-0:6"],
      ["negative indexes", [-4, -2], "0:2-0:6"],
      ["exclude start", [0, 4, true], "0:2-0:7"],
      ["exclude end", [0, 4, false, true], "0:1-0:6"],
      ["exclude both", [0, 4, true, true], "0:2-0:6"],
      ["include both", [0, 4, false, false], "0:1-0:7"],
    ];
    for (const [description, args, expected] of cases) {
      test(description, () => {
        const capture = fixture("f(a, b)").find("argument_list");
        assert.equal(run("child-range!", capture, ...args), true);
        assertRange(capture, expected);
      });
    }
    for (const index of [-6, 5]) {
      test(`rejects out-of-bounds index ${index}`, () => {
        const capture = fixture("f(a, b)").find("argument_list");
        assert.throws(
          () => run("child-range!", capture, index),
          /Start index .* is out of bounds/u,
        );
        assert.throws(
          () => run("child-range!", capture, 0, index),
          /End index .* is out of bounds/u,
        );
      });
    }
    test("supports ranges across lines", () => {
      const capture = fixture("f(\n  a,\n  b\n)").find("argument_list");
      assert.equal(run("child-range!", capture, 1, -2), true);
      assertRange(capture, "1:2-2:3");
    });
    test("rejects nodes without children", () => {
      const capture = fixture("a").find("identifier");
      assert.throws(
        () => run("child-range!", capture, 0),
        /Start index 0 is out of bounds for node with 0 children/u,
      );
    });
  });

  test("character-range! defaults the end offset and can update an already modified range", () => {
    const capture = fixture('"hello"').find("string");
    assert.equal(run("character-range!", capture, 1), true);
    assertRange(capture, "0:1-0:7");
    assert.equal(run("character-range!", capture, 0, -1), true);
    assertRange(capture, "0:1-0:6");
    assert.equal(run("character-range!", capture, -1, 1), true);
    assertRange(capture, "0:0-0:7");
  });

  suite("shrink-to-match!", () => {
    for (const [pattern, expected] of [
      ["hello", "0:7-0:12"],
      ['"{3}(?<keep>hello)', "0:7-0:12"],
      ["hello.*world", "0:7-1:5"],
      ["(?=hello)", "0:7-0:7"],
    ]) {
      test(pattern, () => {
        const capture = fixture('x = """hello\nworld"""').find("string");
        assert.equal(run("shrink-to-match!", capture, pattern), true);
        assertRange(capture, expected);
      });
    }
    test("reports a missing match and invalid regex", () => {
      const capture = fixture('"hello"').find("string");
      assert.throws(
        () => run("shrink-to-match!", capture, "missing"),
        /No match for pattern/u,
      );
      assert.throws(() => run("shrink-to-match!", capture, "["), SyntaxError);
    });
  });

  suite("grow-to-named-siblings!", () => {
    test("grows through trailing named siblings", () => {
      const capture = fixture("a\nb\nc").find("expression_statement", "a");
      assert.equal(run("grow-to-named-siblings!", capture), true);
      assertRange(capture, "0:0-2:1");
    });
    test("stops before the excluded text", () => {
      const capture = fixture("a\nb\nc\nd").find("expression_statement", "a");
      assert.equal(run("grow-to-named-siblings!", capture, "c"), true);
      assertRange(capture, "0:0-1:1");
    });
    for (const [text, type, nodeText, stop] of [
      ["f(a, b)", "identifier", "a", undefined],
      ["a\nb", "expression_statement", "b", undefined],
      ["a\nb", "expression_statement", "a", "b"],
    ] as const) {
      test(`preserves the node when no siblings are included: ${nodeText}, ${stop ?? text}`, () => {
        // oxlint-disable-next-line unicorn/no-array-method-this-argument
        const capture = fixture(text).find(type, nodeText);
        const { node, range } = capture;
        assert.equal(
          run(
            "grow-to-named-siblings!",
            capture,
            ...(stop == null ? [] : [stop]),
          ),
          true,
        );
        assert.equal(capture.node, node);
        assert.equal(capture.range, range);
      });
    }
    test("requires a parent", () => {
      assert.throws(
        () => run("grow-to-named-siblings!", fixture("a").capture()),
        /Node has no parent/u,
      );
    });
  });

  test("trim-end! trims multiple captures across lines and preserves leading whitespace", () => {
    const { find } = fixture('"""  hello  \n\t\n"""');
    const first = find("string_content");
    const second = find("string_content");
    assert.equal(run("trim-end!", first, second), true);
    assertRange(first, "0:3-0:10");
    assertRange(second, "0:3-0:10");
  });

  test("trim-end! preserves the node when there is no trailing whitespace", () => {
    const capture = fixture("hello").find("identifier");
    const { node, range } = capture;
    assert.equal(run("trim-end!", capture), true);
    assert.equal(capture.node, node);
    assert.equal(capture.range, range);
  });

  test("trim-end! can produce an empty range", () => {
    const capture = fixture('""" \t\n"""').find("string_content");
    assert.equal(run("trim-end!", capture), true);
    assertRange(capture, "0:3-0:3");
  });

  test("document-range! expands multiple captures to their respective documents", () => {
    const first = fixture("a\nb\n").find("identifier", "b");
    const second = fixture("xyz").find("identifier");
    assert.equal(run("document-range!", first, second), true);
    assertRange(first, "0:0-2:0");
    assertRange(second, "0:0-0:3");
  });

  test("allow-multiple! sets the flag on every capture", () => {
    const { find } = fixture("a + b");
    const first = find("identifier", "a");
    const second = find("identifier", "b");
    assert.equal(run("allow-multiple!", first, second), true);
    assert.equal(first.allowMultiple, true);
    assert.equal(second.allowMultiple, true);
  });

  test("insertion-delimiter! sets and replaces the delimiter, including an empty string", () => {
    const capture = fixture("a").capture();
    for (const delimiter of [", ", ",\n", ""]) {
      assert.equal(run("insertion-delimiter!", capture, delimiter), true);
      assert.equal(capture.insertionDelimiter, delimiter);
    }
  });

  for (const [text, expected] of [
    ["f(a)", ", "],
    ["f(\na\n)", ",\n"],
  ]) {
    test(`single-or-multi-line-delimiter! for ${JSON.stringify(text)}`, () => {
      const { find } = fixture(text);
      const target = find("identifier", "f");
      const condition = find("argument_list");
      assert.equal(
        run("single-or-multi-line-delimiter!", target, condition, ", ", ",\n"),
        true,
      );
      assert.equal(target.insertionDelimiter, expected);
      assert.equal(condition.insertionDelimiter, undefined);
    });
  }

  for (const [text, expected] of [
    ["f()", ""],
    ["f(\n)", ""],
    ["f(a)", ", "],
    ["f(\na\n)", ",\n"],
  ]) {
    test(`empty-single-multi-delimiter! for ${JSON.stringify(text)}`, () => {
      const { find } = fixture(text);
      const target = find("identifier", "f");
      const condition = find("argument_list");
      assert.equal(
        run(
          "empty-single-multi-delimiter!",
          target,
          condition,
          "",
          ", ",
          ",\n",
        ),
        true,
      );
      assert.equal(target.insertionDelimiter, expected);
      assert.equal(condition.insertionDelimiter, undefined);
    });
  }

  const captureOperand = { type: "capture", name: "capture" } as const;
  const conditionOperand = { type: "capture", name: "condition" } as const;
  const validArguments: Record<OperatorName, (PredicateStep | string)[]> = {
    "even?": [captureOperand, "value"],
    "odd?": [captureOperand, "value"],
    "text?": [captureOperand, "hello"],
    "type?": [captureOperand, "identifier"],
    "not-type?": [captureOperand, "identifier"],
    "not-parent-type?": [captureOperand, "module"],
    "not-child-type?": [captureOperand, "identifier"],
    "is-nth-child?": [captureOperand, "0"],
    "has-multiple-children-of-type?": [captureOperand, "identifier"],
    "child-range!": [captureOperand, "0"],
    "character-range!": [captureOperand, "0"],
    "shrink-to-match!": [captureOperand, "hello"],
    "grow-to-named-siblings!": [captureOperand],
    "trim-end!": [captureOperand, conditionOperand],
    "document-range!": [captureOperand, conditionOperand],
    "allow-multiple!": [captureOperand, conditionOperand],
    "insertion-delimiter!": [captureOperand, ", "],
    "single-or-multi-line-delimiter!": [
      captureOperand,
      conditionOperand,
      ", ",
      ",\n",
    ],
    "empty-single-multi-delimiter!": [
      captureOperand,
      conditionOperand,
      "",
      ", ",
      ",\n",
    ],
  };

  for (const operator of queryPredicateOperators) {
    test(`${operator.name} rejects missing operands`, () => {
      assert.equal(operator.createPredicate([]).success, false);
    });

    const operands: PredicateStep[] = validArguments[operator.name].map(
      (arg) => (typeof arg === "string" ? { type: "string", value: arg } : arg),
    );
    for (const [index, operand] of operands.entries()) {
      if (operand.type !== "capture") {
        continue;
      }
      test(`${operator.name} rejects a literal in place of capture operand ${index}`, () => {
        assert.equal(operator.createPredicate(operands).success, true);
        const invalidOperands = operands.with(index, {
          type: "string",
          value: operand.name,
        });
        assert.equal(operator.createPredicate(invalidOperands).success, false);
      });
    }
  }

  for (const [name, values] of [
    ["is-nth-child?", ["1.5"]],
    ["character-range!", ["hello"]],
    ["child-range!", ["0", "1", "yes"]],
    ["child-range!", ["0", "1", "false", "0"]],
    ["insertion-delimiter!", [",", "extra"]],
  ] as const) {
    test(`${name} rejects invalid arguments ${values.join(", ")}`, () => {
      const operator = queryPredicateOperators.find((op) => op.name === name)!;
      assert.equal(
        operator.createPredicate([
          { type: "capture", name: "capture" },
          ...values.map((value) => ({ type: "string" as const, value })),
        ]).success,
        false,
      );
    });
  }

  test("allow-multiple! accepts missing captures while range operators require them", () => {
    for (const name of [
      "allow-multiple!",
      "trim-end!",
      "document-range!",
    ] as const) {
      const operator = queryPredicateOperators.find((op) => op.name === name)!;
      const result = operator.createPredicate([
        { type: "capture", name: "missing" },
      ]);
      assert.ok(result.success);
      if (name === "allow-multiple!") {
        assert.equal(result.predicate({ captures: [] }), true);
      } else {
        assert.throws(
          () => result.predicate({ captures: [] }),
          /Could not find capture missing/u,
        );
      }
    }
  });

  test("node-dependent predicates report captures whose ranges have already changed", () => {
    const capture = fixture("hello").find("identifier");
    run("character-range!", capture, 1);
    assert.throws(() => run("text?", capture, "ello"), /has no node/u);
  });
});

function run(name: OperatorName, ...args: Operand[]) {
  const operator = queryPredicateOperators.find((op) => op.name === name);
  assert.ok(operator);
  const operands: PredicateStep[] = args.map((arg) =>
    typeof arg === "object"
      ? { type: "capture", name: arg.name }
      : { type: "string", value: String(arg) },
  );
  const result = operator.createPredicate(operands);
  assert.ok(result.success, JSON.stringify(result));
  return result.predicate({
    captures: args.filter((arg) => typeof arg === "object"),
  });
}

function assertRange(capture: MutableQueryCapture, expected: string) {
  assert.deepEqual(capture.range, Range.fromConcise(expected));
  assert.equal(capture.node, undefined);
}
