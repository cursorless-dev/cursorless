import * as vscode from "vscode";
import { Notifier } from "../../util/Notifier";
import {
  Configuration,
  CursorlessConfigKey,
  CursorlessConfiguration,
} from "../ide.types";
import type VscodeIDE from "./VscodeIDE";

export default class VscodeConfiguration implements Configuration {
  private notifier = new Notifier();

  constructor(ide: VscodeIDE) {
    this.onDidChangeConfiguration = this.onDidChangeConfiguration.bind(this);

    ide.disposeOnExit(
      vscode.workspace.onDidChangeConfiguration(this.notifier.notifyListeners),
    );
  }

  getOwnConfiguration<T extends CursorlessConfigKey>(
    key: T,
  ): CursorlessConfiguration[T] | undefined {
    return vscode.workspace
      .getConfiguration("cursorless")
      .get<CursorlessConfiguration[T]>(key);
  }

  onDidChangeConfiguration = this.notifier.registerListener;
}
