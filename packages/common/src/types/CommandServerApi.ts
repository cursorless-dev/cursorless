/**
 * API object for interacting with the command server
 */
export interface CommandServerApi {
  signals: {
    prePhrase: InboundSignal;
  };
}

export interface InboundSignal {
  getVersion(): Promise<string | null>;
}
