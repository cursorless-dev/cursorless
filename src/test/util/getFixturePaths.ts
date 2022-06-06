import * as path from "path";
import { walkFilesSync } from "../../testUtil/walkSync";

export function getFixturesPath() {
  return path.join(__dirname, "../../../src/test/suite/fixtures");
}

export function getFixturePath(fixturePath: string) {
  return path.join(getFixturesPath(), fixturePath);
}

export function getRecordedTestPaths() {
  const directory = path.join(getFixturesPath(), "recorded");

  return walkFilesSync(directory).filter(
    (path) => path.endsWith(".yml") || path.endsWith(".yaml")
  );
}
