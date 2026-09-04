import type { TestCaseFixtureLegacy } from "../../types/TestCaseFixture";
import type { TutorialId } from "../../types/tutorial.types";

export interface TutorialContentProvider {
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
