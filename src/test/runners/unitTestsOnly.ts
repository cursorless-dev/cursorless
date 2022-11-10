// Ensures that the aliases such as @cursorless/common that we define in
// package.json are active
import "module-alias/register";
import * as path from "path";
import { runAllTestsInDir } from "../util/runAllTestsInDir";

export function run(): Promise<void> {
  return runAllTestsInDir(
    path.resolve(__dirname, "../../libs/cursorless-engine"),
  );
}
