const global = globalThis as any;

global.process = {
  env: {},
};

global.console = {
  log: print,
  error: print,
  warn: print,
  debug: print,
};

global.setTimeout = (callback: () => void, _delay: number) => {
  callback();
};
