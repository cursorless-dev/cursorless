/**
 * Debounces a callback.  Uses the `decorationDebounceDelayMs` configuration
 * value to determine the debounce delay.
 */
export class Debouncer {
  private timeoutHandle: NodeJS.Timeout | null = null;

  constructor(
    /** The callback to debounce */
    private callback: () => void,
    private debounceDelayMs: number,
  ) {
    this.run = this.run.bind(this);
  }

  run() {
    if (this.timeoutHandle != null) {
      clearTimeout(this.timeoutHandle);
    }

    this.timeoutHandle = setTimeout(() => {
      this.callback();
      this.timeoutHandle = null;
    }, this.debounceDelayMs);
  }

  dispose() {
    if (this.timeoutHandle != null) {
      clearTimeout(this.timeoutHandle);
    }
  }
}
