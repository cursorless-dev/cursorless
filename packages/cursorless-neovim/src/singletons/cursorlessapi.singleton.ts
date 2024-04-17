import { CursorlessApi } from "../getExtensionApi";

/**
 * This is the `cursorlessapi` singleton
 */
let cursorlessapi_: CursorlessApi | undefined;
// const random = Math.random();
// console.warn(`cursorlessapi.singleton.ts: random=${random}`);
// console.warn(`cursorlessapi.singleton.ts: __filename=${__filename}`);

/**
 * Injects an {@link CursorlessApi} object that can be used to access Cursorless extension features.
 * This function should only be called from a select few places, eg extension
 * activation or when mocking a test.
 * @param cursorlessapi The CursorlessApi to inject
 */
export function injectCursorlessApi(cursorlessapi: CursorlessApi | undefined) {
  // console.warn(
  //   `cursorlessapi.singleton.ts: injectCursorlessApi(): random=${random}`,
  // );
  cursorlessapi_ = cursorlessapi;
}

/**
 * Gets the singleton used to access Cursorless extension features.
 * @throws Error if the cursorlessapi hasn't been injected yet.  Can avoid this by
 * constructing your objects lazily
 * @returns The cursorlessapi object
 */
export async function getCursorlessApi(): Promise<CursorlessApi> {
  // console.warn(
  //   `cursorlessapi.singleton.ts: getCursorlessApi() random=${random}`,
  // );
  if (cursorlessapi_ == null) {
    throw Error("Tried to access cursorlessApi before it was injected");
  }

  return cursorlessapi_;
}
