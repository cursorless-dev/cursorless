import {
  CommandServerApi,
  FocusedElementType,
  InboundSignal,
} from "@cursorless/common";
import { NeovimClient } from "neovim/lib/api/client";

export class NeovimCommandServerApi implements CommandServerApi {
  signals: { prePhrase: InboundSignal };

  constructor(private client: NeovimClient) {
    this.signals = { prePhrase: { getVersion: async () => null } };
  }

  async getFocusedElementType(): Promise<FocusedElementType | undefined> {
    const current_mode = await this.client.mode;
    if (current_mode.mode === "t" || current_mode.mode === "nt") {
      return "terminal";
    } else {
      return "textEditor";
    }
  }
}
