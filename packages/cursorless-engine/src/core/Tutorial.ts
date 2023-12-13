// import { readFile, writeFile } from "fs/promises";
// import { parse } from "node-html-parser";
// import produce from "immer";
// import { sortBy } from "lodash";
// import { ide } from "../singletons/ide.singleton";
// import path from "path";
// import { getCursorlessRepoRoot } from "@cursorless/common";

import { Dictionary } from "lodash";

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
}

export async function tutorialCreate({
  version,
  stepFixture,
}: TutorialCommandArg) {
  if (version !== 0) {
    throw new Error(`Unsupported tutorial api version: ${version}`);
  }

  return stepFixture;
}
