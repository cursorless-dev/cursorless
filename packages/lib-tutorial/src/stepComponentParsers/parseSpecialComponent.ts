import type { StepComponent } from "../types/StepComponent";
import type { TutorialStepTrigger } from "../types/TutorialStepTrigger";

const SPECIAL_COMMANDS = {
  help: "cursorless help",
  next: "tutorial next",
  visualizeNothing: "visualize nothing",
};

/**
 * Parses components of the form `{special:help}`. These are special commands
 * that don't correspond to any cursorless command.
 */
export function parseSpecialComponent(arg: string): StepComponent {
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
    // No default
  }

  return {
    content: {
      type: "command",
      value: SPECIAL_COMMANDS[arg as keyof typeof SPECIAL_COMMANDS],
    },
    trigger,
  };
}
