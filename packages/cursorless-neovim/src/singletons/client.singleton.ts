import { NeovimClient } from "neovim/lib/api/client";

/**
 * This is the `client` singleton
 */
let client_: NeovimClient | undefined;

/**
 * Injects an {@link NeovimClient} object that can be used to interact with the client.
 * This function should only be called from a select few places, eg extension
 * activation or when mocking a test.
 * @param client The client to inject
 */
export function injectClient(client: NeovimClient | undefined) {
  client_ = client;
}

/**
 * Gets the singleton used to interact with the client.
 * @throws Error if the client hasn't been injected yet.  Can avoid this by
 * constructing your objects lazily
 * @returns The client object
 */
export function neovimClient(): NeovimClient {
  if (client_ == null) {
    throw Error("Tried to access neovimClient before it was injected");
  }

  return client_;
}
