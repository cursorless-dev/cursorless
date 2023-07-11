import { FakeIDE, TestCaseFixtureLegacy } from "@cursorless/common";
import { uniq } from "lodash";
import { injectIde } from "../../singletons/ide.singleton";
import tokenGraphemeSplitter from "../../singletons/tokenGraphemeSplitter.singleton";
import { extractTargetKeys } from "../../testUtil/extractTargetKeys";
import { getPartialTargetDescriptors } from "../../util/getPartialTargetDescriptors";
import { upgrade } from "./transformations/upgrade";
import assert = require("assert");

export function checkMarks(originalFixture: TestCaseFixtureLegacy): undefined {
  const command = upgrade(originalFixture).command;

  injectIde(new FakeIDE());
  const graphemeSplitter = tokenGraphemeSplitter();

  const targetedMarks = getPartialTargetDescriptors(command)
    .map(extractTargetKeys)
    .flat();
  const normalizeGraphemes = (key: string): string =>
    graphemeSplitter
      .getTokenGraphemes(key)
      .map((grapheme) => grapheme.text)
      .join("");

  const expectedMarks = [
    ...targetedMarks,
    ...(originalFixture.marksToCheck ?? []),
  ];

  const actualMarks = Object.keys(
    originalFixture.initialState.marks ?? {},
  ) as string[];

  assert.deepStrictEqual(
    uniq(actualMarks.map(normalizeGraphemes)).sort(),
    uniq(expectedMarks.map(normalizeGraphemes)).sort(),
  );

  return undefined;
}
