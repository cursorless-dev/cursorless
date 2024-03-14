// TODO: should we access the one from cursorless-engine instead?
// or pass it as an argument where it is needed?
import { NeovimIDE } from "../ide/neovim/NeovimIDE";

/**
 * This is the `ide` singleton
 */
let ide_: NeovimIDE | undefined;

/**
 * Injects an {@link IDE} object that can be used to interact with the IDE.
 * This function should only be called from a select few places, eg extension
 * activation or when mocking a test.
 * @param ide The ide to inject
 */
export function injectIde(ide: NeovimIDE | undefined) {
  ide_ = ide;
}

/**
 * Gets the singleton used to interact with the IDE.
 * @throws Error if the IDE hasn't been injected yet.  Can avoid this by
 * constructing your objects lazily
 * @returns The IDE object
 */
export function ide(): NeovimIDE {
  if (ide_ == null) {
    throw Error("Tried to access ide before it was injected");
  }

  return ide_;
}
