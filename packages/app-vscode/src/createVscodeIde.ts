import * as crypto from "node:crypto";
import * as os from "node:os";
import * as path from "node:path";
import type { ExtensionContext } from "vscode";
import { FakeFontMeasurements } from "./ide/vscode/hats/FakeFontMeasurements";
import { FontMeasurementsImpl } from "./ide/vscode/hats/FontMeasurementsImpl";
import { VscodeHats } from "./ide/vscode/hats/VscodeHats";
import { VscodeFileSystem } from "./ide/vscode/VscodeFileSystem";
import { VscodeIDE } from "./ide/vscode/VscodeIDE";
import { vscodeApi } from "./vscodeApi";

export async function createVscodeIde(context: ExtensionContext) {
  const vscodeIDE = new VscodeIDE(context);

  const hats = new VscodeHats(
    vscodeIDE,
    vscodeApi,
    context,
    vscodeIDE.runMode === "test"
      ? new FakeFontMeasurements()
      : new FontMeasurementsImpl(context),
  );

  await hats.init();

  // FIXME: Inject this from test runner. Would need to arrange to delay
  // extension initialization, probably by returning a function from extension
  // init that has parameters consisting of test configuration, and have that
  // function do the actual initialization.
  const cursorlessDir =
    vscodeIDE.runMode === "test"
      ? path.join(os.tmpdir(), crypto.randomBytes(16).toString("hex"))
      : path.join(os.homedir(), ".cursorless");

  const fileSystem = new VscodeFileSystem(
    context,
    vscodeIDE.runMode,
    cursorlessDir,
  );

  await fileSystem.initialize();

  return { vscodeIDE, hats, fileSystem };
}
