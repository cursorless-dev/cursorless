import type { CustomSpokenFormGenerator } from "@cursorless/cursorless-engine";
import { getSpokenFormStrict } from "../getSpokenFormStrict";
import type { StepComponent, StepComponentParser } from "../types/StepComponent";

/**
 * Parses components of the form `{grapheme:c}`. Used to refer to the user's
 * custom spoken form for a grapheme.
 */
export class GraphemeComponentParser implements StepComponentParser {
  constructor(private customSpokenFormGenerator: CustomSpokenFormGenerator) {}

  async parse(arg: string): Promise<StepComponent> {
    return {
      content: {
        type: "term",
        value: this.getGraphemeSpokenForm(arg),
      },
    };
  }

  private getGraphemeSpokenForm(grapheme: string) {
    return getSpokenFormStrict(
      this.customSpokenFormGenerator.graphemeToSpokenForm(grapheme),
    );
  }
}
