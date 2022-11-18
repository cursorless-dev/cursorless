import * as vscode from "vscode";
import {
  Configuration,
  ConfigurationScope,
  CursorlessConfiguration,
} from "../../libs/common/ide/types/Configuration";
import { GetFieldType, Paths } from "../../libs/common/ide/types/Paths";
import { Notifier } from "../../libs/common/util/Notifier";
import type VscodeIDE from "./VscodeIDE";

export default class VscodeConfiguration implements Configuration {
  private notifier = new Notifier();

  constructor(ide: VscodeIDE) {
    this.onDidChangeConfiguration = this.onDidChangeConfiguration.bind(this);

    ide.disposeOnExit(
      vscode.workspace.onDidChangeConfiguration(this.notifier.notifyListeners),
    );
  }

  getOwnConfiguration<Path extends Paths<CursorlessConfiguration>>(
    path: Path,
    scope?: ConfigurationScope,
  ): GetFieldType<CursorlessConfiguration, Path> {
    return vscode.workspace
      .getConfiguration("cursorless", scope)
      .get<GetFieldType<CursorlessConfiguration, Path>>(path)!;
  }

  onDidChangeConfiguration = this.notifier.registerListener;
}
