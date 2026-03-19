export class TutorialError extends Error {
  public readonly requiresTalonUpdate: boolean;

  constructor(
    message: string,
    { requiresTalonUpdate }: { requiresTalonUpdate: boolean },
  ) {
    super(message);

    this.requiresTalonUpdate = requiresTalonUpdate;
  }
}
