import assert from "node:assert/strict";
import type { Hats, HatStyleMap, TokenHat } from "@cursorless/lib-common";
import {
  FakeIDE,
  HatStability,
  InMemoryTextEditor,
  Notifier,
  Range,
  tokenHatToPlainObject,
} from "@cursorless/lib-common";
import { TokenGraphemeSplitter } from "../tokenGraphemeSplitter";
import { HatAllocator } from "./HatAllocator";
import { IndividualHatMap } from "./IndividualHatMap";
import { RangeUpdater } from "./updateSelections/RangeUpdater";

suite("HatAllocator", () => {
  test("initial allocation is independent of earlier hat assignments", async () => {
    const ide = new HatTestIDE();
    ide.configuration.mockConfiguration("experimental", {
      ...ide.configuration.getOwnConfiguration("experimental"),
      hatStability: HatStability.stable,
    });
    const splitter = new TokenGraphemeSplitter(ide);
    const rangeUpdater = new RangeUpdater(ide);
    const map = new IndividualHatMap(ide, splitter, rangeUpdater);
    const hats: Hats = {
      isEnabled: true,
      enabledHatStyles: { default: { penalty: 0 }, blue: { penalty: 1 } },
      onDidChangeEnabledHatStyles: new Notifier<[HatStyleMap]>()
        .registerListener,
      onDidChangeIsEnabled: new Notifier<[boolean]>().registerListener,
      setHatRanges: () => Promise.resolve(),
    };
    const allocator = new HatAllocator(ide, splitter, hats, {
      getActiveMap: () => Promise.resolve(map),
    });
    const forcedWorld: TokenHat = {
      hatStyle: "default",
      grapheme: "w",
      token: {
        editor: ide.editor,
        range: new Range(0, 6, 0, 11),
        offsets: { start: 6, end: 11 },
        text: "world",
      },
      hatRange: new Range(0, 6, 0, 7),
    };
    const previousHello: TokenHat = {
      hatStyle: "blue",
      grapheme: "h",
      token: {
        editor: ide.editor,
        range: new Range(0, 0, 0, 5),
        offsets: { start: 0, end: 5 },
        text: "hello",
      },
      hatRange: new Range(0, 0, 0, 1),
    };
    const snapshot = () =>
      map
        .getTokenHats(ide.editor)
        .map(tokenHatToPlainObject)
        .toSorted(
          (a, b) => a.hatRange.start.character - b.hatRange.start.character,
        );

    try {
      // Establish the expected allocation with no earlier editor events.
      await allocator.allocateHats([forcedWorld]);
      const expected = snapshot();

      // Simulate an allocation that occurred before fixture initialization.
      await allocator.allocateHats([previousHello]);
      await allocator.allocateHats([forcedWorld]);
      assert.notDeepEqual(snapshot(), expected);
      assert.ok(map.getToken("blue", "h"), "Normal allocation preserves hats");

      await allocator.allocateHats([forcedWorld], {
        preserveExistingHats: false,
      });
      assert.deepEqual(snapshot(), expected);
      assert.ok(map.getToken("default", "w"), "Forced hats are still applied");

      // A subsequent automatic allocation should preserve the initialized hats.
      await allocator.allocateHats();
      assert.deepEqual(snapshot(), expected);
    } finally {
      map.dispose();
      rangeUpdater.dispose();
      ide.exit();
    }
  });
});

class HatTestIDE extends FakeIDE {
  readonly editor: InMemoryTextEditor = new InMemoryTextEditor({
    ide: this,
    content: "hello world",
  });

  get activeTextEditor() {
    return this.editor;
  }

  get visibleTextEditors() {
    return [this.editor];
  }
}
