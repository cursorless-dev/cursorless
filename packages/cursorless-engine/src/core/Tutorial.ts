// import { readFile, writeFile } from "fs/promises";
// import { parse } from "node-html-parser";
// import produce from "immer";
// import { sortBy } from "lodash";
// import { ide } from "../singletons/ide.singleton";
import path from "path";
// import { getCursorlessRepoRoot } from "@cursorless/common";

// TODO the engine is editor agnostic so we shouldn't really import that
// TODO Editor specific features are accessed via the injected ide instance.
// TODO packages\cursorless-engine\src\singletons\ide.singleton.ts
import { openNewEditor } from "@cursorless/vscode-common";

import * as yaml from "js-yaml";
import { promises as fsp } from "node:fs";

import { TestCaseFixture } from "@cursorless/common";
import { Dictionary } from "lodash";

const tutorial_dir =
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

export async function tutorialCreate({
  version,
  stepFixture,
  yamlFilename,
}: TutorialCommandArg) {
  if (version !== 0) {
    throw new Error(`Unsupported tutorial api version: ${version}`);
  }

  // const fixture = stepFixture as TestCaseFixture;
  createEnvironment(yamlFilename);
  // TODO need to answer to the talon side only what is necessary
  return stepFixture;
}

async function createEnvironment(yamlFilename: string) {
  const buffer = await fsp.readFile(path.join(tutorial_dir, yamlFilename));
  const fixture = yaml.load(buffer.toString()) as TestCaseFixture;

  const editor = await openNewEditor(fixture.initialState.documentContents, {
    languageId: fixture.languageId,
  });
}
