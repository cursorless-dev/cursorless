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
    const currentMode = await this.client.mode;
    if (currentMode.mode === "t" || currentMode.mode === "nt") {
      return "terminal";
    } else {
      return "textEditor";
    }
  }
}
