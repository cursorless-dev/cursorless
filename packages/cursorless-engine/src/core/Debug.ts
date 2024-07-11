import type { Disposable, IDE } from "@cursorless/common";

/**
 * Debug logger
 */
export class Debug {
  private disposableConfiguration?: Disposable;
  private disposableSelection?: Disposable;
  active: boolean;

  constructor(private ide: IDE) {
    ide.disposeOnExit(this);

    this.evaluateSetting = this.evaluateSetting.bind(this);
    this.active = true;

    switch (ide.runMode) {
      // Development mode. Always enable.
      case "development":
        this.enableDebugLog();
        break;
      // Test mode. Always disable.
      case "test":
        this.disableDebugLog();
        break;
      // Production mode. Enable based on user setting.
      case "production":
        this.evaluateSetting();
        this.disposableConfiguration =
          ide.configuration.onDidChangeConfiguration(this.evaluateSetting);
        break;
    }
  }

  log(...args: any[]) {
    if (this.active) {
      console.log(...args);
    }
  }

  dispose() {
    if (this.disposableConfiguration) {
      this.disposableConfiguration.dispose();
    }
    if (this.disposableSelection) {
      this.disposableSelection.dispose();
    }
  }

  private enableDebugLog() {
    this.active = true;
  }

  private disableDebugLog() {
    this.active = false;
    if (this.disposableSelection) {
      this.disposableSelection.dispose();
      this.disposableSelection = undefined;
    }
  }

  private evaluateSetting() {
    const debugEnabled = this.ide.configuration.getOwnConfiguration("debug");
    if (debugEnabled) {
      this.enableDebugLog();
    } else {
      this.disableDebugLog();
    }
  }
}
