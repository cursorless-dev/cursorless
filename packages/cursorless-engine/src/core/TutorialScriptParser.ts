import {
  ActionType,
  CommandComplete,
  ScopeType,
  TestCaseSnapshot,
  TutorialId,
  TutorialStepFragment,
  loadFixture,
} from "@cursorless/common";
import path from "path";
import { TutorialStep, TutorialStepTrigger } from "../api/Tutorial";
import { parseScopeType } from "../customCommandGrammar/parseScopeType";
import { CustomSpokenFormGeneratorImpl } from "../generateSpokenForm/CustomSpokenFormGeneratorImpl";
import { canonicalizeAndValidateCommand } from "./commandVersionUpgrades/canonicalizeAndValidateCommand";
import { defaultSpokenFormMap } from "../spokenForms/defaultSpokenFormMap";
import { invertBy } from "lodash";

// this is trying to catch occurrences of things like "{step:cloneStateInk.yml}"
const re = /{(\w+):([^}]+)}/g;

const SPECIAL_COMMANDS = {
  help: "cursorless help",
  next: "tutorial next",
  visualizeNothing: "visualize nothing",
};

const TERMS = {
  visualize: "visualize",
};

export class TutorialScriptParser {
  private actionMap: Record<string, ActionType[]> = invertBy(
    defaultSpokenFormMap.action,
    (val) => val.spokenForms[0],
  ) as Record<string, ActionType[]>;

  constructor(
    private tutorialRootDir: string,
    private tutorialId: TutorialId,
    private customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
  ) {
    this.parseTutorialStep = this.parseTutorialStep.bind(this);
  }

  async parseTutorialStep(rawContent: string): Promise<TutorialStep> {
    let trigger: TutorialStepTrigger | undefined = undefined;
    let initialState: TestCaseSnapshot | undefined = undefined;
    let languageId: string | undefined = undefined;

    const content: TutorialStepFragment[] = [];
    let currentIndex = 0;
    re.lastIndex = 0;
    for (const {
      0: { length },
      1: type,
      2: arg,
      index,
    } of rawContent.matchAll(re)) {
      if (index > currentIndex) {
        content.push({
          type: "string",
          value: rawContent.slice(currentIndex, index),
        });
      }

      currentIndex = index + length;

      switch (type) {
        case "step": {
          const fixture = await loadFixture(
            path.join(this.tutorialRootDir, this.tutorialId, arg),
          );
          const command = canonicalizeAndValidateCommand(fixture.command);
          content.push({
            type: "command",
            value: this.getCommandSpokenForm(command),
          });
          ({ initialState, languageId } = fixture);
          trigger = {
            type: "command",
            command,
          };
          break;
        }
        case "special":
          content.push({
            type: "command",
            value: SPECIAL_COMMANDS[arg as keyof typeof SPECIAL_COMMANDS],
          });
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
          break;
        case "action":
          content.push({
            type: "term",
            value: this.getActionSpokenForm(this.parseActionId(arg)),
          });
          break;
        case "grapheme":
          content.push({
            type: "term",
            value: this.getGraphemeSpokenForm(arg),
          });
          break;
        case "term":
          content.push({
            type: "term",
            value: TERMS[arg as keyof typeof TERMS],
          });
          break;
        case "scopeType":
          content.push({
            type: "term",
            value: this.getScopeTypeSpokenForm(parseScopeType(arg)),
          });
          break;
        case "visualize": {
          const scopeType = parseScopeType(arg);
          content.push({
            type: "command",
            value: `${TERMS.visualize} ${this.getScopeTypeSpokenForm(scopeType)}`,
          });
          trigger = {
            type: "visualize",
            scopeType,
          };
          break;
        }
        default:
          throw new Error(`Unknown name: ${type}`);
      }
    }

    if (currentIndex < rawContent.length) {
      content.push({
        type: "string",
        value: rawContent.slice(currentIndex),
      });
    }

    return {
      content,
      trigger,
      initialState,
      languageId,
    };
  }

  private parseActionId(arg: string): ActionType {
    const actionIds = this.actionMap[arg];

    if (actionIds == null || actionIds.length === 0) {
      throw new Error(`Unknown action: ${arg}`);
    }

    return actionIds[0];
  }

  /**
   * Handle the argument of a "{step:cloneStateInk.yml}""
   */
  private getCommandSpokenForm(command: CommandComplete) {
    // command to be said for moving to the next step
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

  /**
   * Handle the argument of a "{scopeType:state}"
   */
  private getScopeTypeSpokenForm(scopeType: ScopeType) {
    const spokenForm =
      this.customSpokenFormGenerator.scopeTypeToSpokenForm(scopeType);

    if (spokenForm.type === "error") {
      throw new TutorialError(
        `Error while processing spoken form for scope type: ${spokenForm.reason}`,
        { requiresTalonUpdate: spokenForm.requiresTalonUpdate },
      );
    }

    return spokenForm.spokenForms[0];
  }

  private getActionSpokenForm(actionId: ActionType) {
    const spokenForm =
      this.customSpokenFormGenerator.actionIdToSpokenForm(actionId);

    return spokenForm.spokenForms[0];
  }

  private getGraphemeSpokenForm(grapheme: string) {
    const spokenForm =
      this.customSpokenFormGenerator.graphemeToSpokenForm(grapheme);

    return spokenForm.spokenForms[0];
  }
}

export class TutorialError extends Error {
  public readonly requiresTalonUpdate: boolean;

  constructor(
    message: string,
    { requiresTalonUpdate }: { requiresTalonUpdate: boolean },
  ) {
    super(message);

    this.requiresTalonUpdate = requiresTalonUpdate;
  }
}
