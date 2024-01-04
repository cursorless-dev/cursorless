// import { readFile, writeFile } from "fs/promises";
// import { parse } from "node-html-parser";
// import produce from "immer";
// import { sortBy } from "lodash";
// import { ide } from "../singletons/ide.singleton";
import path from "path";
// import { getCursorlessRepoRoot } from "@cursorless/common";

import * as yaml from "js-yaml";
import { promises as fsp } from "node:fs";

import {
  ScopeType,
  SpokenFormSuccess,
  TestCaseFixture,
} from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import { HatTokenMapImpl } from "./HatTokenMapImpl";
import { CustomSpokenFormGeneratorImpl } from "../generateSpokenForm/CustomSpokenFormGeneratorImpl";
import { canonicalizeAndValidateCommand } from "./commandVersionUpgrades/canonicalizeAndValidateCommand";
import { actions } from "../generateSpokenForm/defaultSpokenForms/actions";

const fs = require("node:fs");

// TODO use a relative path but I'm not sure where these source files are at running time
// and CWD is C:\Users\User\AppData\Local\Programs\Microsoft VS Code\
const tutorialRootDir =
  "C:\\work\\tools\\voicecoding\\cursorless_fork\\packages\\cursorless-vscode-e2e\\src\\suite\\fixtures\\recorded\\tutorial\\";

interface TutorialGetContentArg {
  /**
   * The version of the tutorial command.
   */
  version: 0;

  /**
   * The name of the current tutorial
   */
  tutorialName: string;
}

interface TutorialGetContentResponse {
  /**
   * The version of the tutorial command.
   */
  version: 0;

  /**
   * The text content of the different steps of the current tutorial
   */
  content: Array<string>;

  /**
   * The yaml files of the different steps of the current tutorial (if any)
   */
  yamlFilenames: Array<string>;
}

interface TutorialSetupStepArg {
  /**
   * The version of the tutorial command.
   */
  version: 0;

  /**
   * The name of the current tutorial
   */
  tutorialName: string;

  /**
   * The yaml file for the current step
   */
  yamlFilename: string;
}

export class Tutorial {
  private customSpokenFormGenerator: CustomSpokenFormGeneratorImpl;

  constructor(
    hatTokenMap: HatTokenMapImpl,
    customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
  ) {
    this.getContent = this.getContent.bind(this);
    this.setupStep = this.setupStep.bind(this);

    this.customSpokenFormGenerator = customSpokenFormGenerator;
  }

  async processStep(arg: string, tutorialName: string) {
    const tutorialDir = path.join(tutorialRootDir, tutorialName);
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

  async processScopeType(arg: any) {
    const scopeType = yaml.load(arg.toString()) as ScopeType;
    const spokenForm_ =
      this.customSpokenFormGenerator.scopeTypeToSpokenForm(scopeType);
    const spokenForm = spokenForm_ as SpokenFormSuccess;
    console.log("\t", spokenForm.spokenForms[0]);
    return spokenForm.spokenForms[0];
  }

  async loadTutorialScript(tutorialName: string) {
    const tutorialDir = path.join(tutorialRootDir, tutorialName);
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

  async setupStep({
    version,
    tutorialName,
    yamlFilename,
  }: TutorialSetupStepArg) {
    console.log("setupStep()", tutorialName, yamlFilename);
    if (version !== 0) {
      throw new Error(`Unsupported tutorial api version: ${version}`);
    }

    const tutorialDir = path.join(tutorialRootDir, tutorialName);
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

    const editor = ide().openUntitledTextDocument({
      content: fixture.initialState.documentContents,
      language: fixture.languageId,
    });

    // TODO set up the right hats

    // return to the talon side
    return true;
  }
}
