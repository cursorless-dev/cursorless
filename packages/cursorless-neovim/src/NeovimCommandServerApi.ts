import type {
  CommandServerApi,
  FocusedElementType,
  InboundSignal,
} from "@cursorless/common";
import type { NeovimClient } from "neovim/lib/api/client";

export class NeovimCommandServerApi implements CommandServerApi {
  signals: { prePhrase: InboundSignal };

  constructor(private client: NeovimClient) {
    this.signals = { prePhrase: { getVersion: async () => null } };
  }

  // for vscode, it is actually stored into the command-server
  // but for neovim, it is stored in cursorless
  // https://github.com/pokey/command-server/blob/main/src/extension.ts#L32
  async getFocusedElementType(): Promise<FocusedElementType | undefined> {
    const currentMode = await this.client.mode;
    if (currentMode.mode === "t" || currentMode.mode === "nt") {
      return "terminal";
    } else {
      return "textEditor";
    }
  }
}
