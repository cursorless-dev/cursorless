const global = globalThis as any;

// process.env is used by `immer`
if (global.process == null) {
  global.process = {
    env: {},
  };
}

if (global.performance == null) {
  global.performance = {
    now: () => Date.now(),
  };
}

// Allows us to use `console.*` with quickjs
if (global.console == null && typeof print === "function") {
  global.console = {
    log: print,
    error: print,
    warn: print,
    debug: print,
  };
}

// In quickjs `setTimeout` is not available.
// FIXME: Remove dependency on `setTimeout` in the future.
// https://github.com/cursorless-dev/cursorless/issues/2596
if (global.setTimeout == null) {
  global.setTimeout = (callback: () => void, _delay: number) => {
    callback();
  };
  global.clearTimeout = (_timeoutId: unknown) => {
    // no-op
  };
}
