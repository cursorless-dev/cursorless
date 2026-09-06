/**
 * API object for interacting with the command server
 */
export interface CommandServerApi {
  getFocusedElementType: () => Promise<FocusedElementType | undefined>;

  signals: {
    prePhrase: InboundSignal;
  };
}

export type FocusedElementType = "textEditor" | "terminal" | "other";

export interface InboundSignal {
  getVersion(): Promise<string | null>;
}
