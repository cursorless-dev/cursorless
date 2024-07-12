import type {
  IDE,
  RecordTestCaseCommandOptions,
  TestCaseRecorderStorage,
} from "@cursorless/common";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { getRecordedTestsDirPath } from "./getFixturePaths";
import { walkFiles } from "./walkAsync";
import { existsSync } from "node:fs";

export class FileSystemRecordedTestsStorage implements TestCaseRecorderStorage {
  constructor(private ide: IDE) {}

  getFixtureRoot(): string | null {
    return this.ide.runMode !== "production" ? getRecordedTestsDirPath() : null;
  }

  async saveTestCase(filePath: string, fixture: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, fixture);
  }

  removeTestCase(filePath: string): Promise<void> {
    return fs.unlink(filePath);
  }

  hasAccess(path: string): Promise<boolean> {
    return fs.access(path).then(
      () => true,
      () => false,
    );
  }

  walkDir(dir: string): Promise<string[]> {
    return walkFiles(dir);
  }

  async calculateFilePath(dir: string, filename: string): Promise<string> {
    let filePath = path.join(dir, `${filename}.yml`);

    let i = 2;
    while (existsSync(filePath)) {
      filePath = path.join(dir, `${filename}${i++}.yml`);
    }

    return filePath;
  }

  async getCommandOptions(
    filePath: string,
  ): Promise<RecordTestCaseCommandOptions> {
    let rawText: string;

    try {
      rawText = await fs.readFile(filePath, { encoding: "utf-8" });
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return {};
      }

      throw err;
    }

    return JSON.parse(rawText);
  }
}
