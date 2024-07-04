import { storedTargetKeys } from "../StoredTargetKey";
import SpyIDE from "../ide/spy/SpyIDE";
import { ReadOnlyHatMap } from "../types/HatTokenMap";
import { marksToPlainObject } from "../util/toPlainObject";
import { ExcludableSnapshotField, TestCaseSnapshot } from "./TestCaseSnapshot";
import { extractTargetedMarks } from "./extractTargetedMarks";
import { TestHelpers } from "./runRecordedTest";

/**
 * Get the state of the editor to compare with the expected state of a test case
 *
 * @param finalState The final state of the test case; we only use this to
 * decide which fields we care about
 * @param readableHatMap The hat map for extractin the marks
 * @param spyIde The spy IDE
 * @param takeSnapshot A function that takes a snapshot of the current state of
 * the editor
 * @returns A test case snapshot with any fields excluded that we don't care
 * about for now
 */
export async function getSnapshotForComparison(
  finalState: TestCaseSnapshot | undefined,
  readableHatMap: ReadOnlyHatMap,
  spyIde: SpyIDE,
  takeSnapshot: TestHelpers["takeSnapshot"],
): Promise<Exclude<TestCaseSnapshot, "visibleRanges">> {
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
  );

  return resultState;
}
