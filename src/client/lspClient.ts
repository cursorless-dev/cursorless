import { HatStyleMap } from "../core/hatStyles.types";
import Observable from "../util/Observable";

class LspClient {
  constructor(public activeHatStyles: Observable<HatStyleMap>) {}
}

let lspClient_: LspClient | undefined;

/**
 * Injects an {@link LspClient} object that can be used to interact with the LspClient.
 * This function should only be called from a select few places, eg extension
 * activation or when mocking a test.
 * @param lspClient The lspClient to inject
 */
export function injectLspClient(lspClient: LspClient) {
  lspClient_ = lspClient;
}

/**
 * Gets the singleton used to interact with the LspClient.
 * @throws Error if the LspClient hasn't been injected yet.  Can avoid this by
 * constructing your objects lazily
 * @returns The LspClient object
 */
export default function lspClient(): LspClient {
  if (lspClient_ == null) {
    throw Error("Tried to access lspClient before it was injected");
  }

  return lspClient_;
}
