import type { IDE } from "@cursorless/common";

/**
 * This is the `ide` singleton
 */
let ide_: IDE | undefined;

/**
 * Injects an {@link IDE} object that can be used to interact with the IDE.
 * This function should only be called from a select few places, eg extension
 * activation or when mocking a test.
 * @param ide The ide to inject
 */
export function injectIde(ide: IDE | undefined) {
  ide_ = ide;
}

/**
 * Gets the singleton used to interact with the IDE.
 * @throws Error if the IDE hasn't been injected yet.  Can avoid this by
 * constructing your objects lazily
 * @returns The IDE object
 */
export function ide(): IDE {
  if (ide_ == null) {
    throw Error("Tried to access ide before it was injected");
  }

  return ide_;
}
