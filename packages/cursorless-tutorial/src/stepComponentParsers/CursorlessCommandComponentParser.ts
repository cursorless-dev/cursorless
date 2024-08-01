import type {
  CommandComplete,
  CommandLatest,
  Hats,
  HatStyleMap,
  TestCaseSnapshot,
  TutorialContentProvider,
  TutorialId} from "@cursorless/common";
import {
  getKey,
  splitKey
} from "@cursorless/common";
import type {
  CustomSpokenFormGenerator} from "@cursorless/cursorless-engine";
import {
  canonicalizeAndValidateCommand,
  getPartialTargetDescriptors,
  transformPartialPrimitiveTargets,
} from "@cursorless/cursorless-engine";
import { TutorialError } from "../TutorialError";
import type { StepComponent, StepComponentParser } from "../types/StepComponent";
import { cloneDeep, mapKeys } from "lodash-es";
import { produce } from "immer";

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

    const { command, initialState } = substituteMissingHats(
      this.hats.enabledHatStyles,
      canonicalizeAndValidateCommand(fixture.command),
      fixture.initialState,
    );

    return {
      initialState,
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

/**
 * If the user has particular hats disabled, substitute them with hats that the
 * user actually has enabled.
 *
 * We just pick the first hat in the list of available hats, but it would
 * probably be better to pick a similar hat, eg if the hat is a colored hat,
 * pick a different color.
 *
 * @param hats The IDE hats
 * @param command The command to substitute hats in
 * @param initialState The initial state snapshot to substitute hats in
 * @returns A new command and initial state snapshot with hats substituted
 */
function substituteMissingHats(
  enabledHatStyles: HatStyleMap,
  command: CommandLatest,
  initialState: TestCaseSnapshot,
) {
  command = cloneDeep(command);

  // Update the hats in the command
  transformPartialPrimitiveTargets(
    getPartialTargetDescriptors(command.action),
    (target) => {
      if (target.mark?.type !== "decoratedSymbol") {
        return target;
      }

      const color = target.mark.symbolColor;

      if (enabledHatStyles[color] === undefined) {
        target.mark.symbolColor = Object.keys(enabledHatStyles)[0];
      }

      return target;
    },
  );

  // Update the hats in the initial state snapshot
  if (initialState.marks != null) {
    initialState = produce(initialState, (draft) => {
      draft.marks = mapKeys(draft.marks, (_value, key) => {
        const { hatStyle, character } = splitKey(key);
        if (enabledHatStyles[hatStyle] === undefined) {
          return getKey(Object.keys(enabledHatStyles)[0], character);
        }
        return key;
      });
    });
  }

  return {
    command,
    initialState,
  };
}
