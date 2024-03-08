import { CommandApi } from "@cursorless/cursorless-engine";

/**
 * This is the `cmdapi` singleton
 */
let cmdapi_: CommandApi | undefined;

/**
 * Injects an {@link CommandApi} object that can be used to run Cursorless commands.
 * This function should only be called from a select few places, eg extension
 * activation or when mocking a test.
 * @param cmdapi The CommandApi to inject
 */
export function injectCommandApi(cmdapi: CommandApi | undefined) {
  cmdapi_ = cmdapi;
}

/**
 * Gets the singleton used to run Cursorless commands.
 * @throws Error if the cmdapi hasn't been injected yet.  Can avoid this by
 * constructing your objects lazily
 * @returns The cmdapi object
 */
export function commandApi(): CommandApi {
  if (cmdapi_ == null) {
    throw Error("Tried to access commandApi before it was injected");
  }

  return cmdapi_;
}
