import { ide } from "../singletons/ide.singleton";

export class Debouncer {
  private timeoutHandle: NodeJS.Timeout | null = null;

  constructor(private callback: () => void) {
    this.run = this.run.bind(this);
  }

  run() {
    if (this.timeoutHandle != null) {
      clearTimeout(this.timeoutHandle);
    }

    const decorationDebounceDelayMs = ide().configuration.getOwnConfiguration(
      "decorationDebounceDelayMs",
    );

    this.timeoutHandle = setTimeout(() => {
      this.callback();
      this.timeoutHandle = null;
    }, decorationDebounceDelayMs);
  }

  dispose() {
    if (this.timeoutHandle != null) {
      clearTimeout(this.timeoutHandle);
    }
  }
}
