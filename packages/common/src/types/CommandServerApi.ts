/**
 * API object for interacting with the command server
 */
export interface CommandServerApi {
  getFocusedElementType: () => FocusedElementType | undefined;

  signals: {
    prePhrase: InboundSignal;
  };
}

export type FocusedElementType = "textEditor" | "terminal";

export interface InboundSignal {
  getVersion(): Promise<string | null>;
}
