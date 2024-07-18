import { FakeIDE, TestCaseFixtureLegacy } from "@cursorless/common";
import { uniq } from "lodash-es";
import { injectIde } from "../../singletons/ide.singleton";
import tokenGraphemeSplitter from "../../singletons/tokenGraphemeSplitter.singleton";
import { extractTargetKeys } from "../../testUtil/extractTargetKeys";
import { getPartialTargetDescriptors } from "../../util/getPartialTargetDescriptors";
import assert from "assert";
import { canonicalize } from "./transformations/canonicalize";

export function checkMarks(originalFixture: TestCaseFixtureLegacy): undefined {
  const command = canonicalize(originalFixture).command;

  injectIde(new FakeIDE());
  const graphemeSplitter = tokenGraphemeSplitter();

  const targetedMarks = getPartialTargetDescriptors(command.action)
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

  const actualMarks = Object.keys(originalFixture.initialState.marks ?? {});

  assert.deepStrictEqual(
    uniq(actualMarks.map(normalizeGraphemes)).sort(),
    uniq(expectedMarks.map(normalizeGraphemes)).sort(),
  );

  return undefined;
}
