// import { readFile, writeFile } from "fs/promises";
// import { parse } from "node-html-parser";
// import produce from "immer";
// import { sortBy } from "lodash";
// import { ide } from "../singletons/ide.singleton";
import path from "path";
// import { getCursorlessRepoRoot } from "@cursorless/common";

import * as yaml from "js-yaml";
import { promises as fsp } from "node:fs";

import { TestCaseFixture } from "@cursorless/common";
import { Dictionary } from "lodash";
import { ide } from "../singletons/ide.singleton";
import { HatTokenMapImpl } from "./HatTokenMapImpl";
import { CustomSpokenFormGeneratorImpl } from "../generateSpokenForm/CustomSpokenFormGeneratorImpl";

const tutorialDirectory =
  "C:\\work\\tools\\voicecoding\\cursorless_fork\\packages\\cursorless-vscode-e2e\\src\\suite\\fixtures\\recorded\\tutorial\\unit-2-basic-coding";

/**
 * The argument expected by the tutorial command.
 */
interface TutorialCommandArg {
  /**
   * The version of the tutorial command.
   */
  version: 0;

  /**
   * A representation of the yaml file
   */
  stepFixture: Dictionary<string>;

  /**
   * The yaml file for the current step
   */
  yamlFilename: string;
}

export class Tutorial {
  constructor(
    hatTokenMap: HatTokenMapImpl,
    customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
  ) {
    this.create = this.create.bind(this);
  }

  async create({ version, stepFixture, yamlFilename }: TutorialCommandArg) {
    if (version !== 0) {
      throw new Error(`Unsupported tutorial api version: ${version}`);
    }

    // const fixture = stepFixture as TestCaseFixture;
    this.createEnvironment(yamlFilename);
    // TODO need to answer to the talon side only what is necessary
    return stepFixture;
  }

  async createEnvironment(yamlFilename: string) {
    const buffer = await fsp.readFile(
      path.join(tutorialDirectory, yamlFilename),
    );
    const fixture = yaml.load(buffer.toString()) as TestCaseFixture;

    const editor = ide().openUntitledTextDocument({
      content: fixture.initialState.documentContents,
      language: fixture.languageId,
    });
  }
}