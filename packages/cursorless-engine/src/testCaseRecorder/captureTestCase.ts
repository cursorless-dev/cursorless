import { CommandLatest, ReadOnlyHatMap } from "@cursorless/common";
import { TestCaseRecorder } from "../index";

export async function captureTestCase(
  testCaseRecorder: TestCaseRecorder,
  readableHatMap: ReadOnlyHatMap,
  commandComplete: CommandLatest,
  runner: () => Promise<any>,
) {
  try {
    await testCaseRecorder.preCommandHook(readableHatMap, commandComplete);

    const returnValue = await runner();

    await testCaseRecorder.postCommandHook(returnValue);

    return returnValue;
  } catch (e) {
    await testCaseRecorder.commandErrorHook(e as Error);
    throw e;
  } finally {
    testCaseRecorder.finallyHook();
  }
}
