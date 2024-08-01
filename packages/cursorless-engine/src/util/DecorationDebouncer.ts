import type { Configuration} from "@cursorless/common";
import { Debouncer } from "@cursorless/common";

export class DecorationDebouncer {
  private debouncer: Debouncer;

  constructor(configuration: Configuration, callback: () => void) {
    this.debouncer = new Debouncer(
      callback,
      configuration.getOwnConfiguration("decorationDebounceDelayMs"),
    );
    this.run = this.run.bind(this);
  }

  run() {
    this.debouncer.run();
  }

  dispose() {
    this.debouncer.dispose();
  }
}
