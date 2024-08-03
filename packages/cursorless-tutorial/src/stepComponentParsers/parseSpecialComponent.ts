import type { TutorialStepTrigger } from "../types/TutorialStepTrigger";
import type { StepComponent } from "../types/StepComponent";

const SPECIAL_COMMANDS = {
  help: "cursorless help",
  next: "tutorial next",
  visualizeNothing: "visualize nothing",
};

/**
 * Parses components of the form `{special:help}`. These are special commands
 * that don't correspond to any cursorless command.
 */
export async function parseSpecialComponent(
  arg: string,
): Promise<StepComponent> {
  let trigger: TutorialStepTrigger | undefined = undefined;

  switch (arg) {
    case "help":
      trigger = {
        type: "help",
      };
      break;
    case "visualizeNothing":
      trigger = {
        type: "visualize",
        scopeType: undefined,
      };
      break;
  }

  return {
    content: {
      type: "command",
      value: SPECIAL_COMMANDS[arg as keyof typeof SPECIAL_COMMANDS],
    },
    trigger,
  };
}
