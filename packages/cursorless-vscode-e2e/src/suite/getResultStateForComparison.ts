import {
  ExcludableSnapshotField,
  ReadOnlyHatMap,
  SpyIDE,
  TestCaseSnapshot,
  extractTargetedMarks,
  marksToPlainObject,
  storedTargetKeys,
} from "@cursorless/common";
import { TestHelpers } from "@cursorless/vscode-common";

export async function getResultStateForComparison(
  finalState: TestCaseSnapshot | undefined,
  readableHatMap: ReadOnlyHatMap,
  spyIde: SpyIDE,
  takeSnapshot: TestHelpers["takeSnapshot"],
) {
  const excludeFields: ExcludableSnapshotField[] = [];

  const marks =
    finalState?.marks == null
      ? undefined
      : marksToPlainObject(
          extractTargetedMarks(Object.keys(finalState.marks), readableHatMap),
        );

  if (finalState?.clipboard == null) {
    excludeFields.push("clipboard");
  }

  for (const storedTargetKey of storedTargetKeys) {
    const key = `${storedTargetKey}Mark` as const;
    if (finalState?.[key] == null) {
      excludeFields.push(key);
    }
  }

  // FIXME Visible ranges are not asserted, see:
  // https://github.com/cursorless-dev/cursorless/issues/160
  const { visibleRanges, ...resultState } = await takeSnapshot(
    excludeFields,
    [],
    spyIde.activeTextEditor!,
    spyIde,
    marks,
    // FIXME: Stop overriding the clipboard once we have #559
    true,
  );

  return resultState;
}
