import { ActionType, actionNames } from "@cursorless/common";
import {
  CustomSpokenFormGenerator,
  defaultSpokenFormMap,
} from "@cursorless/cursorless-engine";
import { getSpokenFormStrict } from "../getSpokenFormStrict";
import { StepComponent, StepComponentParser } from "../types/StepComponent";

/**
 * Parses components of the form `{action:chuck}`.
 */
export class ActionComponentParser implements StepComponentParser {
  private actionMap: Record<string, ActionType> = {};

  constructor(private customSpokenFormGenerator: CustomSpokenFormGenerator) {
    for (const actionName of actionNames) {
      const { spokenForms } = defaultSpokenFormMap.action[actionName];
      for (const spokenForm of spokenForms) {
        this.actionMap[spokenForm] = actionName;
      }
    }
  }

  async parse(arg: string): Promise<StepComponent> {
    return {
      content: {
        type: "term",
        value: this.getActionSpokenForm(this.parseActionName(arg)),
      },
    };
  }

  private getActionSpokenForm(actionId: ActionType) {
    return getSpokenFormStrict(
      this.customSpokenFormGenerator.actionIdToSpokenForm(actionId),
    );
  }

  private parseActionName(arg: string): ActionType {
    const actionId = this.actionMap[arg];

    if (actionId == null) {
      throw new Error(`Unknown action: ${arg}`);
    }

    return actionId;
  }
}
