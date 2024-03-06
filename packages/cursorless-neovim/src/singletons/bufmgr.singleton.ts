import { BufferManager } from "../types/BufferManager";

/**
 * This is the `bufmgr` singleton
 */
let bufmgr_: BufferManager | undefined;

/**
 * Injects an {@link BufferManager} object that can be used to interact with the neovim buffer.
 * This function should only be called from a select few places, eg extension
 * activation or when mocking a test.
 * @param bufmgr The BufferManager to inject
 */
export function injectBufferManager(bufmgr: BufferManager | undefined) {
  bufmgr_ = bufmgr;
}

/**
 * Gets the singleton used to interact with the extension.
 * @throws Error if the bufmgr hasn't been injected yet.  Can avoid this by
 * constructing your objects lazily
 * @returns The bufmgr object
 */
export function bufferManager(): BufferManager {
  if (bufmgr_ == null) {
    throw Error("Tried to access bufferManager before it was injected");
  }

  return bufmgr_;
}
