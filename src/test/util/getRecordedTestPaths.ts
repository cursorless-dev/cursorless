import * as path from "path";
import { walkFilesSync } from "../../testUtil/walkSync";

export default function getRecordedTestPaths() {
  const directory = path.join(
    __dirname,
    "../../../src/test/suite/fixtures/recorded"
  );

  return walkFilesSync(directory).filter(
    (path) => path.endsWith(".yml") || path.endsWith(".yaml")
  );
}
