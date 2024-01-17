import * as yaml from "js-yaml";
import fs, { promises as fsp } from "node:fs";
import path from "path";

import {
  ScopeType,
  SpokenFormSuccess,
  TestCaseFixture,
  plainObjectToSelection,
  serializedMarksToTokenHats,
} from "@cursorless/common";
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
  private hatTokenMap: HatTokenMapImpl;
  private customSpokenFormGenerator: CustomSpokenFormGeneratorImpl;
  private tutorialRootDir: string;

  constructor(
    hatTokenMap: HatTokenMapImpl,
    customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
  ) {
    this.getContent = this.getContent.bind(this);
    this.setupStep = this.setupStep.bind(this);

    this.hatTokenMap = hatTokenMap;
    this.customSpokenFormGenerator = customSpokenFormGenerator;

    const extensionPath = ide().assetsRoot;
    this.tutorialRootDir = path.join(extensionPath, "tutorial");
  }

  /**
   * Handle the argument of a "%%step:cloneStateInk.yml%%""
   */
  private async processStep(arg: string, tutorialName: string) {
    const tutorialDir = path.join(this.tutorialRootDir, tutorialName);
    if (!fs.existsSync(tutorialDir)) {
      throw new Error(`Invalid tutorial name: ${tutorialName}`);
    }

    const yamlFile = path.join(tutorialDir, arg);
    if (!fs.existsSync(yamlFile)) {
      throw new Error(
        `Can't file yaml file: ${yamlFile} in tutorial name: ${tutorialName}`,
      );
    }
    const yamlFilename = arg;

    const buffer = await fsp.readFile(yamlFile);
    const fixture = yaml.load(buffer.toString()) as TestCaseFixture;

    // command to be said for moving to the next step
    const spokenForm = this.customSpokenFormGenerator.commandToSpokenForm(
      canonicalizeAndValidateCommand(fixture.command),
    ) as SpokenFormSuccess;
    console.log("\t", spokenForm.spokenForms[0]);
    return [spokenForm.spokenForms[0], yamlFilename];
  }

  /**
   * Handle the argument of a "%%scopeType:{type: statement}%%"
   */
  private async processScopeType(arg: any) {
    const scopeType = yaml.load(arg.toString()) as ScopeType;
    const spokenForm_ =
      this.customSpokenFormGenerator.scopeTypeToSpokenForm(scopeType);
    const spokenForm = spokenForm_ as SpokenFormSuccess;
    console.log("\t", spokenForm.spokenForms[0]);
    return spokenForm.spokenForms[0];
  }

  /**
   * Load the "script.json" script for the current tutorial
   */
  private async loadTutorialScript(tutorialName: string) {
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
    const buffer = await fsp.readFile(scriptFile);
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

    let m;
    let spokenForm;
    const response: TutorialGetContentResponse = {
      version: 0,
      content: [],
      yamlFilenames: [],
    };
    // we need to replace the {...} with the right content
    for (let content of contentList) {
      let yamlFilename = "";
      m = re.exec(content);
      while (m) {
        const name = m[1];
        const arg = m[2];
        console.log(name, arg);
        switch (name) {
          case "step":
            [spokenForm, yamlFilename] = await this.processStep(
              arg,
              tutorialName,
            );
            content = content.replace(m[0], `<cmd@${spokenForm}/>`);
            break;
          case "literalStep":
            content = content.replace(m[0], `<cmd@${arg}/>`);
            break;
          case "action":
            // hardcoded list of default spoken form for an action (not yet the user customized one)
            spokenForm = actions[arg as keyof typeof actions];
            console.log("\t", spokenForm);
            content = content.replace(m[0], `<*"${spokenForm}"/>`);
            break;
          case "scopeType":
            spokenForm = await this.processScopeType(arg);
            content = content.replace(m[0], `<*"${spokenForm}"/>`);
            break;
          default:
            throw new Error(`Unknown name: ${name}`);
        }
        m = re.exec(content);
      }
      response.yamlFilenames.push(yamlFilename);
      response.content.push(content);
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
    yamlFilename,
  }: TutorialSetupStepArg) {
    console.log("setupStep()", tutorialName, yamlFilename);
    if (version !== 0) {
      throw new Error(`Unsupported tutorial api version: ${version}`);
    }

    const tutorialDir = path.join(this.tutorialRootDir, tutorialName);
    if (!fs.existsSync(tutorialDir)) {
      throw new Error(`Invalid tutorial name: ${tutorialName}`);
    }

    // TODO check for directory traversal?
    const yamlFile = path.join(tutorialDir, yamlFilename);
    if (!fs.existsSync(yamlFile)) {
      throw new Error(
        `Can't file yaml file: ${yamlFile} in tutorial name: ${tutorialName}`,
      );
    }
    const buffer = await fsp.readFile(yamlFile);
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
    // in case we don't want to use the createSelection helper function
    // editableEditor.selections = fixture.initialState.selections.map(
    //   (selections) => {
    //     return new Selection(
    //       new Position(selections.anchor.line, selections.anchor.character),
    //       new Position(selections.active.line, selections.active.character),
    //     );
    //   },
    // );

    // Ensure that the expected hats are present
    await this.hatTokenMap.allocateHats(
      serializedMarksToTokenHats(fixture.initialState.marks, editor),
    );
  }
}
