import type { CustomSpokenFormGenerator } from "@cursorless/lib-engine";
import { getSpokenFormStrict } from "../getSpokenFormStrict";
import type { StepComponent } from "../types/StepComponent";
import type { TutorialStepTrigger } from "../types/TutorialStepTrigger";

const SPECIAL_COMMANDS = {
  help: "cursorless help",
  next: "tutorial next",
};

/**
 * Parses components of the form `{special:help}`. These are special commands
 * that don't correspond to any cursorless command.
 */
export function parseSpecialComponent(
  customSpokenFormGenerator: CustomSpokenFormGenerator,
  arg: string,
): StepComponent {
  let trigger: TutorialStepTrigger | undefined = undefined;
  let value: string;

  switch (arg) {
    case "help":
      trigger = {
        type: "help",
      };
      value = SPECIAL_COMMANDS.help;
      break;
    case "next":
      value = SPECIAL_COMMANDS.next;
      break;
    case "visualizeNothing":
      trigger = {
        type: "visualize",
        scopeType: undefined,
      };
      value = getSpokenFormStrict(
        customSpokenFormGenerator.scopeVisualizerIdToSpokenForm(
          "hideScopeVisualizer",
        ),
      );
      break;
    default:
      throw new Error(`Unknown special command: ${arg}`);
  }

  return {
    content: {
      type: "command",
      value,
    },
    trigger,
  };
}
