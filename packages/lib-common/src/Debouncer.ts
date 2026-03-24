/**
 * Debounces a callback.
 */
export class Debouncer {
  private timeoutHandle?: ReturnType<typeof setTimeout>;

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
      this.timeoutHandle = undefined;
    }, this.debounceDelayMs);
  }

  dispose() {
    if (this.timeoutHandle != null) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }
  }
}
