// Allows us to use `console.*` with quickjs
if (typeof print === "function") {
  const global = globalThis as any;

  global.console = {
    log: print,
    error: print,
    warn: print,
    debug: print,
  };
}
