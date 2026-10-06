import type {
  SpokenFormEntry,
  TalonSpokenForms,
  TalonSpokenFormsPayload,
} from "@cursorless/lib-common";

export class FakeTalonSpokenForms implements TalonSpokenForms {
  public static fromGraphemes(graphemes: string[]): FakeTalonSpokenForms {
    return new FakeTalonSpokenForms(
      graphemes.map((grapheme) => ({
        type: "grapheme",
        id: grapheme,
        spokenForms: [],
      })),
    );
  }

  constructor(private spokenForms: SpokenFormEntry[]) {}

  getSpokenForms(): Promise<TalonSpokenFormsPayload> {
    return Promise.resolve({
      version: -1,
      spokenForms: this.spokenForms,
    });
  }

  onDidChange() {
    return {
      dispose: () => {
        // No-op
      },
    };
  }
}
