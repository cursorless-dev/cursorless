import { FakeIDE } from "@cursorless/common";
import * as assert from "assert";
import { WordTokenizer } from "../processTargets/modifiers/scopeHandlers/WordScopeHandler/WordTokenizer";
import { subtokenFixture } from "./fixtures/subtoken.fixture";

suite("subtoken regex matcher", () => {
  const ide = new FakeIDE();

  subtokenFixture.forEach(({ input, expectedOutput }) => {
    test(input, () => {
      assert.deepStrictEqual(
        new WordTokenizer(ide, "anyLang")
          .splitIdentifier(input)
          .map(({ text }) => text),
        expectedOutput,
      );
    });
  });
});
