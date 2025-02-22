import type { TestCaseFixtureLegacy } from "../../types/TestCaseFixture";
import type { TutorialId } from "../../types/tutorial.types";

export interface TutorialContentProvider {
  /**
   * Loads the raw content of all tutorials. Just includes the information in
   * the scripts, not the fixtures that represent commands to run.
   */
  loadRawTutorials(): Promise<RawTutorialContent[]>;

  /**
   * Loads a fixture file from the tutorial directory, eg "takeNear.yml"
   *
   * @param tutorialId The tutorial id
   * @param fixtureName The name of the fixture, eg "takeNear.yml"
   * @returns A promise that resolves to the parsed fixture content
   */
  loadFixture(
    tutorialId: TutorialId,
    fixtureName: string,
  ): Promise<TestCaseFixtureLegacy>;
}

export interface RawTutorialContent {
  /**
   * The unique identifier for the tutorial
   */
  id: TutorialId;

  /**
   * The title of the tutorial
   */
  title: string;

  /**
   * The version of the tutorial
   */
  version: number;

  /**
   * The steps of the current tutorial
   */
  steps: string[];
}
