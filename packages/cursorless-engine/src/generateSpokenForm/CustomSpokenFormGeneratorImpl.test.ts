import assert from "node:assert";
import { CustomSpokenFormGeneratorImpl } from "./CustomSpokenFormGeneratorImpl";
import { LATEST_VERSION, asyncSafety } from "@cursorless/common";

suite("CustomSpokenFormGeneratorImpl", async function () {
  test(
    "basic",
    asyncSafety(async () => {
      const generator = new CustomSpokenFormGeneratorImpl({
        async getSpokenFormEntries() {
          return [
            {
              type: "complexScopeTypeType",
              id: "glyph",
              spokenForms: ["foo"],
            },
            {
              type: "action",
              id: "setSelection",
              spokenForms: ["bar"],
            },
            {
              type: "grapheme",
              id: "a",
              spokenForms: ["alabaster"],
            },
          ];
        },
        onDidChange: () => ({ dispose() {} }),
      });

      await generator.customSpokenFormsInitialized;

      assert.deepStrictEqual(
        generator.scopeTypeToSpokenForm({
          type: "glyph",
          character: "a",
        }),
        {
          type: "success",
          spokenForms: ["foo alabaster"],
        },
      );
      assert.deepStrictEqual(
        generator.commandToSpokenForm({
          version: LATEST_VERSION,
          action: {
            name: "setSelection",
            target: {
              type: "primitive",
              mark: {
                type: "cursor",
              },
            },
          },
          usePrePhraseSnapshot: false,
        }),
        {
          type: "success",
          spokenForms: ["bar this"],
        },
      );
    }),
  );
});
