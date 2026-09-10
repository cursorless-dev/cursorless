import assert from "node:assert/strict";
import path from "node:path";
import type { Hats, HatStyleMap, SimpleTokenHat } from "@cursorless/lib-common";
import {
  FakeIDE,
  HatStability,
  InMemoryTextEditor,
  Notifier,
  plainObjectToSelection,
  serializedMarksToTokenHats,
  tokenHatToPlainObject,
} from "@cursorless/lib-common";
import {
  getCursorlessRepoRoot,
  loadFixture,
} from "@cursorless/lib-node-common";
import { TokenGraphemeSplitter } from "../tokenGraphemeSplitter";
import { HatAllocator } from "./HatAllocator";
import { IndividualHatMap } from "./IndividualHatMap";
import { RangeUpdater } from "./updateSelections/RangeUpdater";

suite("HatAllocator", () => {
  for (const fixtureName of [
    "docs/actions/clearAndSetSelection",
    "tutorial/introduction/changeSit",
    "tutorial/introduction/chuckLineOdd",
  ]) {
    test(`restores recorded allocation history: ${fixtureName}`, async () => {
      const fixture = await loadFixture(
        path.join(
          getCursorlessRepoRoot(),
          "resources/fixtures/recorded",
          `${fixtureName}.yml`,
        ),
      );
      const initialState = fixture.initialState;
      assert.ok(initialState.hatTokenMap);
      const recordedHats = initialState.hatTokenMap;
      const ide = new HatTestIDE(
        initialState.documentContents,
        fixture.languageId,
      );
      ide.configuration.mockConfiguration("experimental", {
        ...ide.configuration.getOwnConfiguration("experimental"),
        hatStability: HatStability.stable,
      });
      await ide.editor.setSelections(
        initialState.selections.map(plainObjectToSelection),
      );
      const splitter = new TokenGraphemeSplitter(ide);
      const rangeUpdater = new RangeUpdater(ide);
      const map = new IndividualHatMap(ide, splitter, rangeUpdater);
      const hats: Hats = {
        isEnabled: true,
        enabledHatStyles: {
          default: { penalty: 0 },
          blue: { penalty: 1 },
          green: { penalty: 1 },
        },
        onDidChangeEnabledHatStyles: new Notifier<[HatStyleMap]>()
          .registerListener,
        onDidChangeIsEnabled: new Notifier<[boolean]>().registerListener,
        setHatRanges: () => Promise.resolve(),
      };
      const allocator = new HatAllocator(ide, splitter, hats, {
        getActiveMap: () => Promise.resolve(map),
      });
      const forcedHats = serializedMarksToTokenHats(
        initialState.marks,
        ide.editor,
      );
      const snapshot = () =>
        map.getTokenHats(ide.editor).map(tokenHatToPlainObject);

      try {
        // A fresh allocation is not the recorded starting state: for example,
        // clearAndSetSelection records a blue b despite default b being free.
        await allocator.allocateHats(forcedHats);
        if (fixtureName === "docs/actions/clearAndSetSelection") {
          assert.notDeepEqual(snapshot(), recordedHats);
        }

        // Test both an empty map and an allocation created by earlier events.
        for (const hasEarlierAllocation of [false, true]) {
          map.setTokenHats([]);
          if (hasEarlierAllocation) {
            await allocator.allocateHats(forcedHats);
          }
          await allocator.allocateHats(forcedHats, {
            initialHats: { editor: ide.editor, hats: recordedHats },
          });
          assert.deepEqual(snapshot(), recordedHats);

          // Normal automatic allocation preserves the restored assignments,
          // although token ordering can change without the forced target ranks.
          await allocator.allocateHats();
          assert.deepEqual(sortHats(snapshot()), sortHats(recordedHats));
        }
      } finally {
        map.dispose();
        rangeUpdater.dispose();
        ide.exit();
      }
    });
  }
});

function sortHats(hats: readonly SimpleTokenHat[]) {
  return hats.toSorted(
    (a, b) =>
      a.hatRange.start.line - b.hatRange.start.line ||
      a.hatRange.start.character - b.hatRange.start.character,
  );
}

class HatTestIDE extends FakeIDE {
  readonly editor: InMemoryTextEditor;

  constructor(content: string, languageId: string) {
    super();
    this.editor = new InMemoryTextEditor({ ide: this, content, languageId });
  }

  get activeTextEditor() {
    return this.editor;
  }

  get visibleTextEditors() {
    return [this.editor];
  }
}
