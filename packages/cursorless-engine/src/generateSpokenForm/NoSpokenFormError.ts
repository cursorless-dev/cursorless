export class NoSpokenFormError extends Error {
  constructor(
    public reason: string,
    public requiresTalonUpdate: boolean = false,
    public isSecret: boolean = false,
  ) {
    super(`No spoken form for: ${reason}`);
  }
}
