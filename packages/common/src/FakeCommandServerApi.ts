import type {
  CommandServerApi,
  FocusedElementType,
  InboundSignal,
} from "./types/CommandServerApi";

export class FakeCommandServerApi implements CommandServerApi {
  private focusedElementType: FocusedElementType | undefined;
  signals: { prePhrase: InboundSignal };

  constructor() {
    this.signals = { prePhrase: { getVersion: async () => null } };
  }

  async getFocusedElementType(): Promise<FocusedElementType | undefined> {
    return this.focusedElementType;
  }

  setFocusedElementType(
    focusedElementType: FocusedElementType | undefined,
  ): void {
    this.focusedElementType = focusedElementType;
  }
}
