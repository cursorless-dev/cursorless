import { CommandComplete } from "@cursorless/common";
import { isEqual } from "lodash-es";
import { CommandRunner } from "../CommandRunner";
import { Tutorial } from "../api/Tutorial";
import { TutorialContent } from "./types/tutorial.types";

/**
 * If the tutorial is currently active and we are in a step that is waiting
 * for a command to be run, we wrap the command runner so that we can
 * automatically advance to the next step when the expected command is run.
 */
export function tutorialWrapCommandRunner(
  tutorial: Tutorial,
  commandRunner: CommandRunner,
  currentTutorial: TutorialContent | undefined,
): CommandRunner {
  if (tutorial.state.type !== "doingTutorial") {
    return commandRunner;
  }

  const currentStep = currentTutorial?.steps[tutorial.state.stepNumber];

  if (currentStep?.trigger?.type !== "command") {
    return commandRunner;
  }

  const trigger = currentStep.trigger;

  return {
    run: async (commandComplete: CommandComplete) => {
      const returnValue = await commandRunner.run(commandComplete);

      if (isEqual(trigger.command.action, commandComplete.action)) {
        await tutorial.next();
      }

      return returnValue;
    },
  };
}
