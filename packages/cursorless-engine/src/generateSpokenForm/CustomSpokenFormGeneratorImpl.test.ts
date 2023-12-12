import assert from "node:assert";
import { CustomSpokenFormGeneratorImpl } from "./CustomSpokenFormGeneratorImpl";
import { asyncSafety } from "@cursorless/common";

suite("CustomSpokenFormGeneratorImpl", async function () {
  test(
    "glyph",
    asyncSafety(async () => {
      const generator = new CustomSpokenFormGeneratorImpl({
        async getSpokenFormEntries() {
          return [
            {
              type: "complexScopeTypeType",
              id: "glyph",
              spokenForms: ["foo"],
            },
          ];
        },
        onDidChange: () => ({ dispose() {} }),
      });

      await generator.customSpokenFormsInitialized;

      const spokenForm = generator.scopeTypeToSpokenForm({
        type: "glyph",
        character: "a",
      });

      assert.deepStrictEqual(spokenForm, {
        type: "success",
        spokenForms: ["foo air"],
      });
    }),
  );
});
