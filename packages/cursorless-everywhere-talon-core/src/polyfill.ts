const global = globalThis as any;

// process.env is used by `immer`
if (global.process == null) {
  global.process = {
    env: {},
  };
}

// Allows us to use `console.*` with quickjs.
// Use `print` if available (Talon's QuickJS), otherwise no-op (HatBox's QuickJS).
if (global.console == null) {
  const sink = typeof print !== "undefined" ? print : () => {};
  global.console = {
    log: sink,
    error: sink,
    warn: sink,
    debug: sink,
  };
}

// In quickjs `setTimeout` is not available.
// FIXME: Remove dependency on `setTimeout` in the future.
// https://github.com/cursorless-dev/cursorless/issues/2596
global.setTimeout = (callback: () => void, _delay: number) => {
  callback();
};
