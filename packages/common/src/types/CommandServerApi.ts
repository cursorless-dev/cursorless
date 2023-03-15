export interface CommandServerApi {
  signals: {
    prePhrase: InboundSignal;
  };
}

export interface InboundSignal {
  getVersion(): Promise<string | null>;
}
