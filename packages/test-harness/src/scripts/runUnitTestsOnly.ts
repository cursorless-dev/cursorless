/**
 * Runs all tests that don't have to be run within VSCode.
 */
import { getCursorlessRepoRoot } from "@cursorless/common";
import * as path from "path";
import { runAllTestsInDir } from "../util/runAllTestsInDir";

runAllTestsInDir(path.join(getCursorlessRepoRoot(), "packages"), false, false);
