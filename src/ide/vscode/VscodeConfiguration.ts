import * as vscode from "vscode";
import { Graph } from "../../typings/Types";
import { Notifier } from "../../util/Notifier";
import { Configuration } from "../ide.types";
import { VscodeIDE } from "./VscodeIDE";

export class VscodeConfiguration implements Configuration {
  private notifier = new Notifier();
  private mocks: Record<string, unknown> = {};

  constructor(private ide: VscodeIDE) {
    this.onDidChangeConfiguration = this.onDidChangeConfiguration.bind(this);

    ide.disposeOnExit(
      vscode.workspace.onDidChangeConfiguration(this.notifier.notifyListeners)
    );
  }

  getOwnConfiguration<T>(key: string): T | undefined {
    if (key in this.mocks) {
      return this.mocks[key] as T;
    }

    return vscode.workspace.getConfiguration("cursorless").get<T>(key);
  }

  onDidChangeConfiguration = this.notifier.registerListener;

  mockConfiguration<T>(key: string, value: T): void {
    this.mocks[key] = value;
  }

  resetMocks(): void {
    this.mocks = {};
  }
}
