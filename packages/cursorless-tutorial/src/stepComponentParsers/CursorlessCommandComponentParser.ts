import {
  CommandComplete,
  TutorialContentProvider,
  TutorialId,
} from "@cursorless/common";
import {
  CustomSpokenFormGenerator,
  canonicalizeAndValidateCommand,
} from "@cursorless/cursorless-engine";
import { TutorialError } from "../TutorialError";
import { StepComponent, StepComponentParser } from "../types/StepComponent";

/**
 * Parses components of the form `{command:takeNear.yml}`. The argument
 * (`takeNear.yml`) is the name of a fixture file in the tutorial directory.
 */
export class CursorlessCommandComponentParser implements StepComponentParser {
  constructor(
    private contentProvider: TutorialContentProvider,
    private tutorialId: TutorialId,
    private customSpokenFormGenerator: CustomSpokenFormGenerator,
  ) {}

  async parse(arg: string): Promise<StepComponent> {
    const fixture = await this.contentProvider.loadFixture(
      this.tutorialId,
      arg,
    );
    const command = canonicalizeAndValidateCommand(fixture.command);

    return {
      initialState: fixture.initialState,
      languageId: fixture.languageId,
      trigger: {
        type: "command",
        command,
      },
      content: {
        type: "command",
        value: this.getCommandSpokenForm(command),
      },
    };
  }

  private getCommandSpokenForm(command: CommandComplete) {
    const spokenForm =
      this.customSpokenFormGenerator.commandToSpokenForm(command);

    if (spokenForm.type === "error") {
      throw new TutorialError(
        `Error while processing spoken form for command: ${spokenForm.reason}`,
        { requiresTalonUpdate: spokenForm.requiresTalonUpdate },
      );
    }

    return spokenForm.spokenForms[0];
  }
}
