import { CursorlessApi } from "../getExtensionApi";

/**
 * This is the `cursorlessapi` singleton
 */
let cursorlessapi_: CursorlessApi | undefined;

/**
 * Injects an {@link CursorlessApi} object that can be used to access Cursorless extension features.
 * This function should only be called from a select few places, eg extension
 * activation or when mocking a test.
 * @param cursorlessapi The CursorlessApi to inject
 */
export function injectCursorlessApi(cursorlessapi: CursorlessApi | undefined) {
  cursorlessapi_ = cursorlessapi;
}

/**
 * Gets the singleton used to access Cursorless extension features.
 * @throws Error if the cursorlessapi hasn't been injected yet.  Can avoid this by
 * constructing your objects lazily
 * @returns The cursorlessapi object
 */
export async function getCursorlessApi(): Promise<CursorlessApi> {
  if (cursorlessapi_ == null) {
    throw Error("Tried to access cursorlessApi before it was injected");
  }

  return cursorlessapi_;
}
