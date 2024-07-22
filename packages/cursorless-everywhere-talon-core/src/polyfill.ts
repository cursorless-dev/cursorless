const global = globalThis as any;

if (global.process == null) {
  global.process = {
    env: {},
  };
}

if (global.console == null) {
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
