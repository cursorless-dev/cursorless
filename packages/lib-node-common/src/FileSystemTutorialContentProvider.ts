import path from "node:path";
import type {
  TestCaseFixtureLegacy,
  TutorialContentProvider,
  TutorialId,
} from "@cursorless/lib-common";
import { loadFixture } from "./loadFixture";

export class FileSystemTutorialContentProvider implements TutorialContentProvider {
  private tutorialRootDir: string;

  constructor(assetsRoot: string) {
    this.tutorialRootDir = path.join(assetsRoot, "tutorial");
  }

  loadFixture(
    tutorialId: TutorialId,
    fixtureName: string,
  ): Promise<TestCaseFixtureLegacy> {
    return loadFixture(
      path.join(this.tutorialRootDir, tutorialId, fixtureName),
    );
  }
}
