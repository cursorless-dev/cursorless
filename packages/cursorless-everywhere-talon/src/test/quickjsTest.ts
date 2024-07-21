import { getTestHelpers } from "talon";
import { activate } from "cursorless.mjs";
import type { ActionDescriptor, CommandLatest } from "@cursorless/common";

async function runTests() {
  await activate();

  console.log();
  console.log("Running quickjs tests");

  await test("testTake", testTake);
  await test("testChuck", testChuck);
}

async function testTake() {
  const testHelpers = getTestHelpers();
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
  const testHelpers = getTestHelpers();

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
  const command: CommandLatest = {
    version: 7,
    usePrePhraseSnapshot: false,
    action,
  };
  return getTestHelpers().contextActions.private_cursorless_run_rpc_command_get(
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
  }
}

await runTests();
