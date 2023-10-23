import {
  TestCaseFixtureLegacy,
  getRecordedTestPaths,
  serializeTestFixture,
  shouldUpdateFixtures,
} from "@cursorless/common";
import * as yaml from "js-yaml";
import * as assert from "node:assert";
import { promises as fsp } from "node:fs";
import { canonicalizeAndValidateCommand } from "../core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { getHatMapCommand } from "./getHatMapCommand";
import { SpokenFormGenerator } from ".";
import { defaultSpokenFormInfoMap } from "../spokenForms/defaultSpokenFormMap";
import { SpokenFormMap, mapSpokenForms } from "../spokenForms/SpokenFormMap";

/**
 * A spoken form map to use for testing. Just uses default spoken forms, but
 * enables spoken forms that are disabled by default.
 */
const spokenFormMap: SpokenFormMap = mapSpokenForms(
  defaultSpokenFormInfoMap,
  ({ defaultSpokenForms, isPrivate }) => ({
    spokenForms: isPrivate ? [] : defaultSpokenForms,
    isCustom: false,
    defaultSpokenForms,
    requiresTalonUpdate: false,
    isPrivate,
  }),
);

suite("Generate spoken forms", () => {
  getRecordedTestPaths().forEach(({ name, path }) =>
    test(name, () => runTest(path)),
  );

  test("generate spoken form for custom regex", () => {
    const generator = new SpokenFormGenerator({
      ...spokenFormMap,
      customRegex: {
        foo: {
          spokenForms: ["bar"],
          isCustom: true,
          defaultSpokenForms: [],
          requiresTalonUpdate: false,
          isPrivate: false,
        },
      },
    });

    const spokenForm = generator.processScopeType({
      type: "customRegex",
      regex: "foo",
    });

    assert(spokenForm.type === "success");
    assert.equal(spokenForm.spokenForms, "bar");
  });
});

async function runTest(file: string) {
  const buffer = await fsp.readFile(file);
  const fixture = yaml.load(buffer.toString()) as TestCaseFixtureLegacy;

  const generator = new SpokenFormGenerator(spokenFormMap);

  const generatedSpokenForm = generator.processCommand(
    canonicalizeAndValidateCommand(fixture.command),
  );

  if (generatedSpokenForm.type === "success") {
    assert(generatedSpokenForm.spokenForms.length === 1);
  }

  if (fixture.marksToCheck != null && generatedSpokenForm.type === "success") {
    // If the test has marks to check (eg a hat token map test), it will end in
    // "take <mark>" as a way to indicate which mark to check
    const hatMapSpokenForm = generator.processCommand(
      getHatMapCommand(fixture.marksToCheck),
    );
    assert(hatMapSpokenForm.type === "success");
    assert(hatMapSpokenForm.spokenForms.length === 1);
    generatedSpokenForm.spokenForms[0] += " " + hatMapSpokenForm.spokenForms[0];
  }

  if (shouldUpdateFixtures()) {
    if (generatedSpokenForm.type === "success") {
      fixture.command.spokenForm = generatedSpokenForm.spokenForms[0];
      fixture.spokenFormError = undefined;
    } else {
      fixture.spokenFormError = generatedSpokenForm.reason;
      // Leave spoken form itself in case it's helpful
    }

    await fsp.writeFile(file, serializeTestFixture(fixture));
  } else {
    if (generatedSpokenForm.type === "success") {
      assert.equal(
        fixture.command.spokenForm,
        generatedSpokenForm.spokenForms[0],
      );
      assert.equal(fixture.spokenFormError, undefined);
    } else {
      assert.equal(fixture.spokenFormError, generatedSpokenForm.reason);
      // Don't care what the spoken form is in the test case if we don't know
      // how to generate it
    }
  }
}
