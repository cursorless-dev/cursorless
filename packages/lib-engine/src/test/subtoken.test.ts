import * as assert from "node:assert/strict";
import { FakeIDE } from "@cursorless/lib-common";
import { WordTokenizer } from "../processTargets/modifiers/scopeHandlers/WordScopeHandler/WordTokenizer";
import { subtokenFixture } from "./fixtures/subtoken.fixture";

suite("subtoken regex matcher", () => {
  const ide = new FakeIDE();

  subtokenFixture.forEach(({ input, expectedOutput }) => {
    test(input, () => {
      assert.deepEqual(
        new WordTokenizer(ide, "anyLang")
          .splitIdentifier(input)
          .map(({ text }) => text),
        expectedOutput,
      );
    });
  });
});
