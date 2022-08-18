import * as vscode from "vscode";
import { Notifier } from "../../util/Notifier";
import {
  Configuration,
  CursorlessConfigKey,
  CursorlessConfiguration,
} from "../ide.types";
import { VscodeIDE } from "./VscodeIDE";

export class VscodeConfiguration implements Configuration {
  private notifier = new Notifier();
  private mocks: Partial<CursorlessConfiguration> = {};

  constructor(private ide: VscodeIDE) {
    this.onDidChangeConfiguration = this.onDidChangeConfiguration.bind(this);

    ide.disposeOnExit(
      vscode.workspace.onDidChangeConfiguration(this.notifier.notifyListeners)
    );
  }

  getOwnConfiguration<T extends CursorlessConfigKey>(
    key: T
  ): CursorlessConfiguration[T] | undefined {
    if (key in this.mocks) {
      return this.mocks[key];
    }

    return vscode.workspace
      .getConfiguration("cursorless")
      .get<CursorlessConfiguration[T]>(key);
  }

  onDidChangeConfiguration = this.notifier.registerListener;

  mockConfiguration<T extends CursorlessConfigKey>(
    key: T,
    value: CursorlessConfiguration[T]
  ): void {
    this.mocks[key] = value;
  }

  resetMocks(): void {
    this.mocks = {};
  }
}
