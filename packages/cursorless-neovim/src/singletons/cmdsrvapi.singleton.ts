import { CommandServerApi } from "@cursorless/common";

/**
 * This is the `cmdsrvapi` singleton
 */
let cmdsrvapi_: CommandServerApi | undefined;

/**
 * Injects an {@link CommandServerApi} object that can be used to access CommandServer APIs.
 * This function should only be called from a select few places, eg extension
 * activation or when mocking a test.
 * @param cmdsrvapi The CommandServerApi to inject
 */
export function injectCommandServerApi(
  cmdsrvapi: CommandServerApi | undefined,
) {
  cmdsrvapi_ = cmdsrvapi;
}

/**
 * Gets the singleton used to access CommandServer APIs.
 * @throws Error if the cmdsrvapi hasn't been injected yet.  Can avoid this by
 * constructing your objects lazily
 * @returns The cmdsrvapi object
 */
export function commandServerApi(): CommandServerApi {
  if (cmdsrvapi_ == null) {
    throw Error("Tried to access commandServerApi before it was injected");
  }

  return cmdsrvapi_;
}
