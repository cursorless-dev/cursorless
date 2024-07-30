import {
  CommandComplete,
  getKey,
  Hats,
  splitKey,
  TutorialContentProvider,
  TutorialId,
} from "@cursorless/common";
import {
  CustomSpokenFormGenerator,
  canonicalizeAndValidateCommand,
  getPartialTargetDescriptors,
  transformPartialPrimitiveTargets,
} from "@cursorless/cursorless-engine";
import { TutorialError } from "../TutorialError";
import { StepComponent, StepComponentParser } from "../types/StepComponent";
import { cloneDeep, mapKeys } from "lodash-es";

/**
 * Parses components of the form `{command:takeNear.yml}`. The argument
 * (`takeNear.yml`) is the name of a fixture file in the tutorial directory.
 */
export class CursorlessCommandComponentParser implements StepComponentParser {
  constructor(
    private contentProvider: TutorialContentProvider,
    private tutorialId: TutorialId,
    private customSpokenFormGenerator: CustomSpokenFormGenerator,
    private hats: Hats,
  ) {}

  async parse(arg: string): Promise<StepComponent> {
    const fixture = await this.contentProvider.loadFixture(
      this.tutorialId,
      arg,
    );
    const command = cloneDeep(canonicalizeAndValidateCommand(fixture.command));

    transformPartialPrimitiveTargets(
      getPartialTargetDescriptors(command.action),
      (target) => {
        if (target.mark?.type !== "decoratedSymbol") {
          return target;
        }

        const color = target.mark.symbolColor;

        if (this.hats.enabledHatStyles[color] === undefined) {
          target.mark.symbolColor = Object.keys(this.hats.enabledHatStyles)[0];
        }

        return target;
      },
    );

    if (fixture.initialState.marks != null) {
      fixture.initialState.marks = mapKeys(
        fixture.initialState.marks,
        (_value, key) => {
          const { hatStyle, character } = splitKey(key);
          if (this.hats.enabledHatStyles[hatStyle] === undefined) {
            return getKey(
              Object.keys(this.hats.enabledHatStyles)[0],
              character,
            );
          }
          return key;
        },
      );
    }

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
