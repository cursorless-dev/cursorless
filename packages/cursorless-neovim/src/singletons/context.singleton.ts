import { NeovimExtensionContext } from "../ide/neovim/NeovimExtensionContext";

/**
 * This is the `context` singleton
 */
let context_: NeovimExtensionContext | undefined;

/**
 * Injects an {@link NeovimExtensionContext} object that can be used to interact with the extension.
 * This function should only be called from a select few places, eg extension
 * activation or when mocking a test.
 * @param context The context to inject
 */
export function injectContext(context: NeovimExtensionContext | undefined) {
  context_ = context;
}

/**
 * Gets the singleton used to interact with the extension.
 * @throws Error if the context hasn't been injected yet.  Can avoid this by
 * constructing your objects lazily
 * @returns The context object
 */
export function neovimContext(): NeovimExtensionContext {
  if (context_ == null) {
    throw Error("Tried to access neovimContext before it was injected");
  }

  return context_;
}
