import { StoredTargetKey, groupBy, toCharacterRange } from "@cursorless/common";
import { StoredTargetMap } from "@cursorless/cursorless-engine";
import {
  ScopeRangeType,
  ScopeVisualizerColorConfig,
} from "@cursorless/vscode-common";
import { VscodeIDE } from "./ide/vscode/VscodeIDE";
import { VscodeFancyRangeHighlighter } from "./ide/vscode/VSCodeScopeVisualizer/VscodeFancyRangeHighlighter";
import { getColorsFromConfig } from "./ide/vscode/VSCodeScopeVisualizer/getColorsFromConfig";
import { mapValues } from "lodash-es";
import { usingSetting } from "./usingSetting";

const targetColorMap: Partial<Record<StoredTargetKey, ScopeRangeType>> = {
  instanceReference: "domain",
  keyboard: "content",
};

/**
 * Constructs the stored target highlighter and listens for changes to stored
 * targets, highlighting them in the editor.
 * @param ide The ide object
 * @param storedTargets Keeps track of stored targets
 * @returns A disposable that disposes of the stored target highlighter
 */
export function storedTargetHighlighter(
  ide: VscodeIDE,
  storedTargets: StoredTargetMap,
) {
  return usingSetting<ScopeVisualizerColorConfig>(
    "cursorless.scopeVisualizer",
    "colors",
    (colorConfig) => {
      const highlighters = mapValues(targetColorMap, (type) =>
        type == null
          ? undefined
          : new VscodeFancyRangeHighlighter(
              getColorsFromConfig(colorConfig, type),
            ),
      );

      const storedTargetsDisposable = storedTargets.onStoredTargets(
        (key, targets) => {
          const highlighter = highlighters[key];

          if (highlighter == null) {
            return;
          }

          const editorRangeMap = groupBy(
            targets ?? [],
            ({ editor }) => editor.id,
          );

          ide.visibleTextEditors.forEach((editor) => {
            highlighter.setRanges(
              editor,
              (editorRangeMap.get(editor.id) ?? []).map(({ contentRange }) =>
                toCharacterRange(contentRange),
              ),
            );
          });
        },
      );

      return {
        dispose: () => {
          for (const highlighter of Object.values(highlighters)) {
            highlighter?.dispose();
          }

          storedTargetsDisposable.dispose();
        },
      };
    },
  );
}
