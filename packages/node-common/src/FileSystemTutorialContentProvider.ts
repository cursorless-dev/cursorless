import type {
  RawTutorialContent,
  TutorialContentProvider,
  TutorialId,
} from "@cursorless/common";
import { readFile, readdir } from "node:fs/promises";
import path from "path";
import { loadFixture } from "./loadFixture";

export class FileSystemTutorialContentProvider
  implements TutorialContentProvider
{
  private tutorialRootDir: string;

  constructor(assetsRoot: string) {
    this.tutorialRootDir = path.join(assetsRoot, "tutorial");
  }

  async loadRawTutorials() {
    const tutorialDirs = await readdir(this.tutorialRootDir, {
      withFileTypes: true,
    });

    return await Promise.all(
      tutorialDirs
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => this.loadTutorialScript(dirent.name as TutorialId)),
    );
  }

  private async loadTutorialScript(
    tutorialId: string,
  ): Promise<RawTutorialContent> {
    const buffer = await readFile(
      path.join(this.tutorialRootDir, tutorialId, "script.json"),
    );

    return {
      id: tutorialId,
      ...JSON.parse(buffer.toString()),
    };
  }

  async loadFixture(tutorialId: TutorialId, fixtureName: string) {
    return loadFixture(
      path.join(this.tutorialRootDir, tutorialId, fixtureName),
    );
  }
}
