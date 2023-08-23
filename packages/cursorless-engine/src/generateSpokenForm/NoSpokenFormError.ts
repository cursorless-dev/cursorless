export class NoSpokenFormError extends Error {
  constructor(public reason: string) {
    super(`No spoken form for: ${reason}`);
  }
}
