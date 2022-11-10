import { TokenGraphemeSplitter } from "../tokenGraphemeSplitter/tokenGraphemeSplitter";

/**
 * Returns the token grapheme splitter singleton, constructing it if it doesn't exist.
 * @returns The token grapheme splitter singleton
 */

export default function tokenGraphemeSplitter(): TokenGraphemeSplitter {
  if (tokenGraphemeSplitter_ == null) {
    tokenGraphemeSplitter_ = new TokenGraphemeSplitter();
  }

  return tokenGraphemeSplitter_;
}
/**
 * This is the token grapheme splitter singleton
 */
let tokenGraphemeSplitter_: TokenGraphemeSplitter | undefined;
