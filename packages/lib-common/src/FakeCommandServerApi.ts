import type {
  CommandServerApi,
  FocusedElementType,
  InboundSignal,
} from "./types/CommandServerApi";

export class FakeCommandServerApi implements CommandServerApi {
  private focusedElementType: FocusedElementType | undefined;
  signals: { prePhrase: InboundSignal };

  constructor() {
    this.signals = {
      prePhrase: {
        getVersion: () => Promise.resolve(null),
      },
    };
  }

  getFocusedElementType(): Promise<FocusedElementType | undefined> {
    return Promise.resolve(this.focusedElementType);
  }

  setFocusedElementType(
    focusedElementType: FocusedElementType | undefined,
  ): void {
    this.focusedElementType = focusedElementType;
  }
}
