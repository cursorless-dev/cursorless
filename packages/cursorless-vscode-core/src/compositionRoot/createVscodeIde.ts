import * as vscode from "vscode";
import { VscodeHats, VscodeIDE } from "..";
import { FakeFontMeasurements } from "../ide/vscode/hats/FakeFontMeasurements";
import { FontMeasurementsImpl } from "../ide/vscode/hats/FontMeasurementsImpl";

export async function createVscodeIde(context: vscode.ExtensionContext) {
  const vscodeIDE = new VscodeIDE(context);

  const hats = new VscodeHats(
    vscodeIDE,
    context,
    vscodeIDE.runMode === "test"
      ? new FakeFontMeasurements()
      : new FontMeasurementsImpl(context),
  );
  await hats.init();

  return { vscodeIDE, hats };
}
