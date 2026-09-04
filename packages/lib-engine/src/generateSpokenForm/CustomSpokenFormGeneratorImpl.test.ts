import assert from "node:assert/strict";
import { FakeIDE, LATEST_VERSION, asyncSafety } from "@cursorless/lib-common";
import { CustomSpokenFormGeneratorImpl } from "./CustomSpokenFormGeneratorImpl";

suite("CustomSpokenFormGeneratorImpl", () => {
  test(
    "uses custom spoken forms and defaults for types omitted by Talon",
    asyncSafety(async () => {
      const generator = new CustomSpokenFormGeneratorImpl(new FakeIDE(), {
        getSpokenForms() {
          return Promise.resolve({
            version: 0,
            spokenForms: [
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
              {
                type: "specialMark",
                id: "currentSelection",
                spokenForms: ["this"],
              },
              {
                type: "scopeVisualizer",
                id: "showScopeVisualizer",
                spokenForms: ["inspect scopes"],
              },
            ],
          });
        },
        onDidChange: () => ({
          dispose() {
            // no-op
          },
        }),
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
        generator.scopeVisualizerIdToSpokenForm("showScopeVisualizer"),
        {
          type: "success",
          spokenForms: ["inspect scopes"],
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

      assert.deepEqual(
        generator.commandToSpokenForm({
          version: LATEST_VERSION,
          action: {
            name: "setSelection",
            target: {
              type: "primitive",
              mark: {
                type: "decoratedSymbol",
                symbolColor: "blue",
                character: "a",
              },
            },
          },
          usePrePhraseSnapshot: false,
        }),
        {
          type: "success",
          spokenForms: ["bar blue alabaster"],
        },
      );
    }),
  );

  test(
    "requires a Talon update when version 1 omits an entry type",
    asyncSafety(async () => {
      const generator = new CustomSpokenFormGeneratorImpl(new FakeIDE(), {
        getSpokenForms() {
          return Promise.resolve({
            version: 1,
            spokenForms: [
              {
                type: "action",
                id: "setSelection",
                spokenForms: ["take"],
              },
            ],
          });
        },
        onDidChange: () => ({
          dispose() {
            // no-op
          },
        }),
      });

      await generator.customSpokenFormsInitialized;

      const spokenForm = generator.commandToSpokenForm({
        version: LATEST_VERSION,
        action: {
          name: "setSelection",
          target: {
            type: "primitive",
            mark: {
              type: "decoratedSymbol",
              symbolColor: "blue",
              character: "a",
            },
          },
        },
        usePrePhraseSnapshot: false,
      });

      assert.equal(spokenForm.type, "error");
      assert.equal(spokenForm.requiresTalonUpdate, true);
      assert.match(spokenForm.reason, /hat color with id blue/u);
    }),
  );
});
