import type { ActionDescriptor, CommandV7 } from "@cursorless/common";
import { activate } from "@cursorless/cursorless-everywhere-talon-core";
import * as std from "std";
import talonMock from "./talonMock";

let hasFailed = false;

async function runTests() {
  await activate(talonMock, "test");

  console.log();
  console.log("Running quickjs tests");

  await test("testTake", testTake);
  await test("testChuck", testChuck);

  std.exit(hasFailed ? 1 : 0);
}

async function testTake() {
  const testHelpers = talonMock.getTestHelpers();
  const initialText = "Hello, world!";

  testHelpers.setEditorState({
    text: initialText,
    selections: [{ anchor: 0, active: 0 }],
  });

  await runAction({
    name: "setSelection",
    target: {
      type: "primitive",
      modifiers: [{ type: "containingScope", scopeType: { type: "token" } }],
    },
  });

  const { text, selections } = testHelpers.getFinalEditorState();

  assert.equal(text, initialText);
  assert.equal(selections.length, 1);
  assert.equal(selections[0].anchor, 0);
  assert.equal(selections[0].active, 5);
}

async function testChuck() {
  const testHelpers = talonMock.getTestHelpers();

  testHelpers.setEditorState({
    text: "Hello, world!",
    selections: [{ anchor: 0, active: 0 }],
  });

  await runAction({
    name: "remove",
    target: {
      type: "primitive",
      modifiers: [{ type: "containingScope", scopeType: { type: "token" } }],
    },
  });

  const { text, selections } = testHelpers.getFinalEditorState();

  assert.equal(text, ", world!");
  assert.equal(selections.length, 1);
  assert.equal(selections[0].anchor, 0);
  assert.equal(selections[0].active, 0);
}

function runAction(action: ActionDescriptor) {
  const command: CommandV7 = {
    version: 7,
    usePrePhraseSnapshot: false,
    action,
  };
  return talonMock
    .getTestHelpers()
    .contextActions.private_cursorless_talonjs_run_and_wait(
      "cursorless.command",
      command,
    );
}

const assert = {
  equal: (actual: unknown, expected: unknown) => {
    if (actual !== expected) {
      throw new Error(`Actual '${actual}' Expected '${expected}'`);
    }
  },
};

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`    * ${name}`);
  } catch (error) {
    console.error(`    x ${name}`);
    console.error(error);
    hasFailed = true;
  }
}

await runTests();
