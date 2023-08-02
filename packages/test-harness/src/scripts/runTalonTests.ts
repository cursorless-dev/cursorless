/**
 * Runs all Talon tests.
 */
import { getCursorlessRepoRoot } from "@cursorless/common";
import * as path from "path";
import { runAllTestsInDir } from "../util/runAllTestsInDir";

runAllTestsInDir(path.join(getCursorlessRepoRoot(), "packages"), false, true);
