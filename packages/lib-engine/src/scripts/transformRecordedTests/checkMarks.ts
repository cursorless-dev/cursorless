import * as assert from "node:assert/strict";
import { uniq } from "lodash-es";
import type { TestCaseFixtureLegacy } from "@cursorless/lib-common";
import { FakeIDE } from "@cursorless/lib-common";
import { extractTargetKeys } from "../../testUtil/extractTargetKeys";
import { TokenGraphemeSplitter } from "../../tokenGraphemeSplitter/tokenGraphemeSplitter";
import { getPartialTargetDescriptors } from "../../util/getPartialTargetDescriptors";
import { canonicalize } from "./transformations/canonicalize";

export function checkMarks(originalFixture: TestCaseFixtureLegacy): undefined {
  const command = canonicalize(originalFixture).command;

  const graphemeSplitter = new TokenGraphemeSplitter(new FakeIDE());

  const targetedMarks = getPartialTargetDescriptors(command.action).flatMap(
    extractTargetKeys,
  );
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

  assert.deepEqual(
    uniq(actualMarks.map(normalizeGraphemes)).toSorted(),
    uniq(expectedMarks.map(normalizeGraphemes)).toSorted(),
  );

  return undefined;
}
