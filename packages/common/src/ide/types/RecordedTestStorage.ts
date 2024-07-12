import type { RecordTestCaseCommandOptions } from "../../testUtil/RecordTestCaseCommandOptions";

export interface TestCaseRecorderStorage {
  getFixtureRoot(): string | null;
  saveTestCase(path: string, fixture: string): Promise<void>;
  removeTestCase(filePath: string): Promise<void>;
  hasAccess(path: string): Promise<boolean>;
  walkDir(dir: string): Promise<string[]>;
  calculateFilePath(dir: string, filename: string): Promise<string>;
  getCommandOptions(filePath: string): Promise<RecordTestCaseCommandOptions>;
}
