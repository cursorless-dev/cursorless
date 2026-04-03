const global = globalThis as any;

// Allows us to use `console.*` with quickjs
if (typeof global.print === "function") {
  global.console = {
    log: global.print,
    error: global.print,
    warn: global.print,
    debug: global.print,
  };
}

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

// oxlint-disable-next-line unicorn/require-module-specifiers
export {};
