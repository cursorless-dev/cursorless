import {
  ScopeType,
  TestCaseFixture,
  plainObjectToSelection,
  serializedMarksToTokenHats,
} from "@cursorless/common";
import * as yaml from "js-yaml";
import { readFile } from "node:fs/promises";
import path from "path";
import {
  Tutorial,
  TutorialGetContentArg,
  TutorialGetContentResponse,
  TutorialSetupStepArg,
} from "../api/Tutorial";
import { CustomSpokenFormGeneratorImpl } from "../generateSpokenForm/CustomSpokenFormGeneratorImpl";
import { actions } from "../generateSpokenForm/defaultSpokenForms/actions";
import { ide } from "../singletons/ide.singleton";
import { HatTokenMapImpl } from "./HatTokenMapImpl";
import { canonicalizeAndValidateCommand } from "./commandVersionUpgrades/canonicalizeAndValidateCommand";

export class TutorialImpl implements Tutorial {
  private tutorialRootDir: string;

  constructor(
    private hatTokenMap: HatTokenMapImpl,
    private customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
  ) {
    this.getContent = this.getContent.bind(this);
    this.setupStep = this.setupStep.bind(this);

    this.tutorialRootDir = path.join(ide().assetsRoot, "tutorial");
  }

  /**
   * Handle the argument of a "%%step:cloneStateInk.yml%%""
   */
  private async processStep(tutorialName: string, yamlFilename: string) {
    const fixture = await this.loadFixture(tutorialName, yamlFilename);

    // command to be said for moving to the next step
    const spokenForm = this.customSpokenFormGenerator.commandToSpokenForm(
      canonicalizeAndValidateCommand(fixture.command),
    );

    if (spokenForm.type === "error") {
      throw new Error(
        `Error while processing spoken form for command ${fixture.command}: ${spokenForm.reason}`,
      );
    }

    return spokenForm.spokenForms[0];
  }

  private async loadFixture(
    tutorialName: string,
    yamlFilename: string,
  ): Promise<TestCaseFixture> {
    const yamlPath = path.join(
      this.tutorialRootDir,
      tutorialName,
      yamlFilename,
    );

    const buffer = await readFile(yamlPath);
    return yaml.load(buffer.toString()) as TestCaseFixture;
  }

  /**
   * Handle the argument of a "%%scopeType:{type: statement}%%"
   */
  private async processScopeType(arg: string) {
    const scopeType = yaml.load(arg) as ScopeType;
    const spokenForm =
      this.customSpokenFormGenerator.scopeTypeToSpokenForm(scopeType);

    if (spokenForm.type === "error") {
      throw new Error(
        `Error while processing spoken form for command ${arg}: ${spokenForm.reason}`,
      );
    }

    return spokenForm.spokenForms[0];
  }

  /**
   * Load the "script.json" script for the current tutorial
   */
  private async loadTutorialScript(tutorialName: string): Promise<string[]> {
    const scriptFile = path.join(
      this.tutorialRootDir,
      tutorialName,
      "script.json",
    );

    const buffer = await readFile(scriptFile);
    const contentList = JSON.parse(buffer.toString());
    return contentList;
  }

  /**
   * Handle the "cursorless.tutorial.getContent" command
   */
  async getContent({ version, tutorialName }: TutorialGetContentArg) {
    if (version !== 0) {
      throw new Error(`Unsupported tutorial api version: ${version}`);
    }

    const contentList = await this.loadTutorialScript(tutorialName);

    // this is trying to catch occurrences of things like "%%step:cloneStateInk.yml%%"
    const re = /%%(\w+):([^%]+)%%/;

    let spokenForm;
    const response: TutorialGetContentResponse = {
      version: 0,
      steps: [],
    };
    // we need to replace the {...} with the right content
    for (let content of contentList) {
      let fixturePath: string | undefined = undefined;
      let m = re.exec(content);
      while (m) {
        const [fullMatch, type, arg] = m;
        switch (type) {
          case "step":
            fixturePath = arg;
            spokenForm = await this.processStep(tutorialName, arg);
            content = content.replace(fullMatch, `<cmd@${spokenForm}/>`);
            break;
          case "literalStep":
            content = content.replace(fullMatch, `<cmd@${arg}/>`);
            break;
          case "action":
            // TODO: don't use hardcoded list of default spoken form for an action (not yet the user customized one)
            spokenForm = actions[arg as keyof typeof actions];
            content = content.replace(fullMatch, `<*"${spokenForm}"/>`);
            break;
          case "scopeType":
            spokenForm = await this.processScopeType(arg);
            content = content.replace(fullMatch, `<*"${spokenForm}"/>`);
            break;
          default:
            throw new Error(`Unknown name: ${type}`);
        }
        m = re.exec(content);
      }
      response.steps.push({
        content,
        fixturePath,
      });
    }

    // return to the talon side
    return response;
  }

  /**
   * Handle the "cursorless.tutorial.setupStep" command
   * @see packages/cursorless-vscode-e2e/src/suite/recorded.vscode.test.ts
   */
  async setupStep({
    version,
    tutorialName,
    fixturePath,
  }: TutorialSetupStepArg) {
    if (version !== 0) {
      throw new Error(`Unsupported tutorial api version: ${version}`);
    }

    // TODO check for directory traversal?
    const fixture = await this.loadFixture(tutorialName, fixturePath);

    const editor = await ide().openUntitledTextDocument({
      content: fixture.initialState.documentContents,
      language: fixture.languageId,
    });
    const editableEditor = ide().getEditableTextEditor(editor);

    // Ensure that the expected cursor/selections are present
    editableEditor.selections = fixture.initialState.selections.map(
      plainObjectToSelection,
    );

    // Ensure that the expected hats are present
    await this.hatTokenMap.allocateHats(
      serializedMarksToTokenHats(fixture.initialState.marks, editor),
    );
  }
}
