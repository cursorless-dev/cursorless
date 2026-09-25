import assert from "node:assert/strict";
import type {
  EditableTextEditor,
  Hats,
  HatStyleMap,
  TextEditor,
  TokenHat,
} from "@cursorless/lib-common";
import {
  FakeIDE,
  InMemoryTextEditor,
  Notifier,
  Range,
  tokenHatToPlainObject,
} from "@cursorless/lib-common";
import { createCursorlessEngine } from "../cursorlessEngine";

const lettersToPreserve = ["å", "ä", "ö", "ا", "ب", "ت", "ج"];
const unicodeTestCases = [
  { name: "Swedish å", content: "aåa", grapheme: "å" },
  { name: "Swedish ä", content: "aäa", grapheme: "ä" },
  { name: "Swedish ö", content: "oöo", grapheme: "ö" },
  { name: "Arabic alif", content: "aاa", grapheme: "ا" },
  { name: "Arabic taa", content: "aتa", grapheme: "ت" },
  { name: "Arabic jeem", content: "aجa", grapheme: "ج" },
  { name: "Arabic beh, isolated form", content: "اب", grapheme: "ب" },
  { name: "Arabic beh, initial form", content: "ابا", grapheme: "ب" },
  { name: "Arabic beh, medial form", content: "تبت", grapheme: "ب" },
  { name: "Arabic beh, final form", content: "تب", grapheme: "ب" },
];

suite("Unicode support", () => {
  for (const { name, content, grapheme } of unicodeTestCases) {
    test(`targets ${name}`, async () => {
      const ide = new UnicodeTestIDE(content);
      ide.configuration.mockConfiguration("tokenHatSplittingMode", {
        preserveCase: false,
        lettersToPreserve,
        symbolsToPreserve: [],
      });
      const engine = await createCursorlessEngine({
        ide,
        hats: createTestHats(),
      });
      const tokenRange = new Range(0, 0, 0, content.length);
      const forcedHat: TokenHat = {
        hatStyle: "default",
        grapheme,
        token: {
          editor: ide.editor,
          range: tokenRange,
          offsets: { start: 0, end: content.length },
          text: content,
        },
        hatRange: tokenRange,
      };

      try {
        await engine.hatTokenMap.allocateHats([forcedHat], {
          startFresh: true,
        });
        const hatMap = await engine.hatTokenMap.getReadableMap(false);

        assert.deepEqual(
          hatMap.getTokenHats(ide.editor).map(tokenHatToPlainObject),
          [
            {
              hatStyle: "default",
              grapheme,
              hatRange: {
                start: { line: 0, character: 1 },
                end: { line: 0, character: 2 },
              },
            },
          ],
        );

        await engine.commandApi.runCommand({
          version: 7,
          spokenForm: `change ${grapheme}`,
          action: {
            name: "clearAndSetSelection",
            target: {
              type: "primitive",
              mark: {
                type: "decoratedSymbol",
                symbolColor: "default",
                character: grapheme,
              },
            },
          },
          usePrePhraseSnapshot: false,
        });

        assert.equal(ide.editor.document.getText(), "");
      } finally {
        ide.exit();
      }
    });
  }
});

class UnicodeTestIDE extends FakeIDE {
  readonly editor: InMemoryTextEditor;

  constructor(content: string) {
    super();
    this.editor = new InMemoryTextEditor({ ide: this, content });
  }

  get activeTextEditor() {
    return this.editor;
  }

  get visibleTextEditors() {
    return [this.editor];
  }

  getEditableTextEditor(editor: TextEditor): EditableTextEditor {
    assert.ok(this.editor.isEqual(editor));
    return this.editor;
  }
}

function createTestHats(): Hats {
  return {
    isEnabled: true,
    enabledHatStyles: { default: { penalty: 0 }, blue: { penalty: 1 } },
    onDidChangeEnabledHatStyles: new Notifier<[HatStyleMap]>().registerListener,
    onDidChangeIsEnabled: new Notifier<[boolean]>().registerListener,
    setHatRanges: () => Promise.resolve(),
  };
}
