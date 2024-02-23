import {
  ScopeType,
  SpokenFormSuccess,
  TestCaseFixture,
  plainObjectToSelection,
  serializedMarksToTokenHats,
} from "@cursorless/common";
import * as yaml from "js-yaml";
import fs from "node:fs";
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
  private async processStep(yamlFilename: string, tutorialName: string) {
    const tutorialDir = path.join(this.tutorialRootDir, tutorialName);
    if (!fs.existsSync(tutorialDir)) {
      throw new Error(`Invalid tutorial name: ${tutorialName}`);
    }

    const yamlPath = path.join(tutorialDir, yamlFilename);
    if (!fs.existsSync(yamlPath)) {
      throw new Error(
        `Can't file yaml file: ${yamlPath} in tutorial name: ${tutorialName}`,
      );
    }

    const buffer = await readFile(yamlPath);
    const fixture = yaml.load(buffer.toString()) as TestCaseFixture;

    // command to be said for moving to the next step
    const spokenForm = this.customSpokenFormGenerator.commandToSpokenForm(
      canonicalizeAndValidateCommand(fixture.command),
    ) as SpokenFormSuccess;
    console.log("\t", spokenForm.spokenForms[0]);
    return spokenForm.spokenForms[0];
  }

  /**
   * Handle the argument of a "%%scopeType:{type: statement}%%"
   */
  private async processScopeType(arg: string) {
    const scopeType = yaml.load(arg) as ScopeType;
    const spokenForm_ =
      this.customSpokenFormGenerator.scopeTypeToSpokenForm(scopeType);
    const spokenForm = spokenForm_ as SpokenFormSuccess;
    console.log("\t", spokenForm.spokenForms[0]);
    return spokenForm.spokenForms[0];
  }

  /**
   * Load the "script.json" script for the current tutorial
   */
  private async loadTutorialScript(tutorialName: string): Promise<string[]> {
    const tutorialDir = path.join(this.tutorialRootDir, tutorialName);
    if (!fs.existsSync(tutorialDir)) {
      throw new Error(`Invalid tutorial name: ${tutorialName}`);
    }

    const scriptFile = path.join(tutorialDir, "script.json");
    if (!fs.existsSync(scriptFile)) {
      throw new Error(
        `Can't file script file: ${scriptFile} in tutorial name: ${tutorialName}`,
      );
    }
    const buffer = await readFile(scriptFile);
    const contentList = JSON.parse(buffer.toString());
    console.log(contentList);
    return contentList;
  }

  /**
   * Handle the "cursorless.tutorial.getContent" command
   */
  async getContent({ version, tutorialName }: TutorialGetContentArg) {
    console.log(
      "getContent(){ version, tutorialName, yamlFilename }: TutorialSetupStepArg",
      tutorialName,
    );
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
        console.log(type, arg);
        switch (type) {
          case "step":
            fixturePath = arg;
            spokenForm = await this.processStep(arg, tutorialName);
            content = content.replace(fullMatch, `<cmd@${spokenForm}/>`);
            break;
          case "literalStep":
            content = content.replace(fullMatch, `<cmd@${arg}/>`);
            break;
          case "action":
            // TODO: don't use hardcoded list of default spoken form for an action (not yet the user customized one)
            spokenForm = actions[arg as keyof typeof actions];
            console.log("\t", spokenForm);
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
    console.log("setupStep()", tutorialName, fixturePath);
    if (version !== 0) {
      throw new Error(`Unsupported tutorial api version: ${version}`);
    }

    const tutorialDir = path.join(this.tutorialRootDir, tutorialName);
    if (!fs.existsSync(tutorialDir)) {
      throw new Error(`Invalid tutorial name: ${tutorialName}`);
    }

    // TODO check for directory traversal?
    const yamlFile = path.join(tutorialDir, fixturePath);
    if (!fs.existsSync(yamlFile)) {
      throw new Error(
        `Can't file yaml file: ${yamlFile} in tutorial name: ${tutorialName}`,
      );
    }
    const buffer = await readFile(yamlFile);
    const fixture = yaml.load(buffer.toString()) as TestCaseFixture;

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