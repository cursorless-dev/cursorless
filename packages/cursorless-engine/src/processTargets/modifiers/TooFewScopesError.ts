export class TooFewScopesError extends Error {
  constructor(requestedLength: number, currentLength: number, scopeType: string) {
    super(
      `Requested ${requestedLength} ${scopeType}s, but ${currentLength} are already selected.`,
    );
    this.name = "TooFewScopesError";
  }
}
