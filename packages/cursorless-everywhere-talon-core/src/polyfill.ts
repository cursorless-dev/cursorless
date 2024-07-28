const global = globalThis as any;

// process.env is used by `immer`
if (global.process == null) {
  global.process = {
    env: {},
  };
}

// Allows us to use `console.*` with quickjs
if (typeof print !== "undefined") {
  global.console = {
    log: print,
    error: print,
    warn: print,
    debug: print,
  };
}

global.setTimeout = (callback: () => void, _delay: number) => {
  callback();
};
