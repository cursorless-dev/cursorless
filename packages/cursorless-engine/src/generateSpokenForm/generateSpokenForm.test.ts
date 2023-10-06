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
import { defaultSpokenFormInfo } from "../DefaultSpokenFormMap";
import { mapValues } from "lodash";
import { SpokenFormMap, SpokenFormMapEntry } from "../SpokenFormMap";

const spokenFormMap = mapValues(defaultSpokenFormInfo, (entry) =>
  mapValues(
    entry,
    ({ defaultSpokenForms }): SpokenFormMapEntry => ({
      spokenForms: defaultSpokenForms,
      isCustom: false,
      defaultSpokenForms,
      requiresTalonUpdate: false,
      isSecret: false,
    }),
  ),
) as SpokenFormMap;

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
          isCustom: false,
          defaultSpokenForms: ["bar"],
          requiresTalonUpdate: false,
          isSecret: false,
        },
      },
    });

    const spokenForm = generator.scopeType({
      type: "customRegex",
      regex: "foo",
    });

    assert(spokenForm.type === "success");
    assert.equal(spokenForm.preferred, "bar");
  });
});

async function runTest(file: string) {
  const buffer = await fsp.readFile(file);
  const fixture = yaml.load(buffer.toString()) as TestCaseFixtureLegacy;

  const generator = new SpokenFormGenerator(spokenFormMap);

  const generatedSpokenForm = generator.command(
    canonicalizeAndValidateCommand(fixture.command),
  );

  if (fixture.marksToCheck != null && generatedSpokenForm.type === "success") {
    // If the test has marks to check (eg a hat token map test), it will end in
    // "take <mark>" as a way to indicate which mark to check
    const hatMapSpokenForm = generator.command(
      getHatMapCommand(fixture.marksToCheck),
    );
    assert(hatMapSpokenForm.type === "success");
    generatedSpokenForm.preferred += " " + hatMapSpokenForm.preferred;
  }

  if (shouldUpdateFixtures()) {
    if (generatedSpokenForm.type === "success") {
      fixture.command.spokenForm = generatedSpokenForm.preferred;
      fixture.spokenFormError = undefined;
    } else {
      fixture.spokenFormError = generatedSpokenForm.reason;
      // Leave spoken form itself in case it's helpful
    }

    await fsp.writeFile(file, serializeTestFixture(fixture));
  } else {
    if (generatedSpokenForm.type === "success") {
      assert.equal(fixture.command.spokenForm, generatedSpokenForm.preferred);
      assert.equal(fixture.spokenFormError, undefined);
    } else {
      assert.equal(fixture.spokenFormError, generatedSpokenForm.reason);
      // Don't care what the spoken form is in the test case if we don't know
      // how to generate it
    }
  }
}
