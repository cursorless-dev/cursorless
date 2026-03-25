import * as assert from "node:assert/strict";
import { FakeIDE, LATEST_VERSION, asyncSafety } from "@cursorless/lib-common";
import { CustomSpokenFormGeneratorImpl } from "./CustomSpokenFormGeneratorImpl";

suite("CustomSpokenFormGeneratorImpl", async function () {
  test(
    "basic",
    asyncSafety(async () => {
      const generator = new CustomSpokenFormGeneratorImpl(new FakeIDE(), {
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

      assert.deepEqual(
        generator.scopeTypeToSpokenForm({
          type: "glyph",
          character: "a",
        }),
        {
          type: "success",
          spokenForms: ["foo alabaster"],
        },
      );
      assert.deepEqual(
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
