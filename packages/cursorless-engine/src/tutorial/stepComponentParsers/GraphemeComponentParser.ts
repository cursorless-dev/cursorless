import { CustomSpokenFormGeneratorImpl } from "../../generateSpokenForm/CustomSpokenFormGeneratorImpl";
import { StepComponent, StepComponentParser } from "../types/StepComponent";

/**
 * Parses components of the form `{grapheme:c}`. Used to refer to the user's
 * custom spoken form for a grapheme.
 */
export class GraphemeComponentParser implements StepComponentParser {
  constructor(
    private customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
  ) {}

  async parse(arg: string): Promise<StepComponent> {
    return {
      content: {
        type: "term",
        value: this.getGraphemeSpokenForm(arg),
      },
    };
  }

  private getGraphemeSpokenForm(grapheme: string) {
    const spokenForm =
      this.customSpokenFormGenerator.graphemeToSpokenForm(grapheme);

    return spokenForm.spokenForms[0];
  }
}
