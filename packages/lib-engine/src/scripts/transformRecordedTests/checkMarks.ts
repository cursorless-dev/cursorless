import type { TestCaseFixtureLegacy } from "@cursorless/lib-common";
import { FakeIDE } from "@cursorless/lib-common";
import assert from "assert";
import { uniq } from "lodash-es";
import { extractTargetKeys } from "../../testUtil/extractTargetKeys";
import { TokenGraphemeSplitter } from "../../tokenGraphemeSplitter/tokenGraphemeSplitter";
import { getPartialTargetDescriptors } from "../../util/getPartialTargetDescriptors";
import { canonicalize } from "./transformations/canonicalize";

export function checkMarks(originalFixture: TestCaseFixtureLegacy): undefined {
  const command = canonicalize(originalFixture).command;

  const graphemeSplitter = new TokenGraphemeSplitter(new FakeIDE());

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
