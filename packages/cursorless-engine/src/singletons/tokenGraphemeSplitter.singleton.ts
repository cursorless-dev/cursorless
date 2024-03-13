import { TokenGraphemeSplitter } from "../tokenGraphemeSplitter/tokenGraphemeSplitter";

/**
 * Returns the token grapheme splitter singleton, constructing it if it doesn't exist.
 * @returns The token grapheme splitter singleton
 */
// TODO: async
export default async function tokenGraphemeSplitter(): Promise<TokenGraphemeSplitter> {
  if (tokenGraphemeSplitter_ == null) {
    tokenGraphemeSplitter_ = await TokenGraphemeSplitter.create();
  }

  return tokenGraphemeSplitter_;
}
/**
 * This is the token grapheme splitter singleton
 */
let tokenGraphemeSplitter_: TokenGraphemeSplitter | undefined;
