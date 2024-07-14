/* eslint-disable @typescript-eslint/naming-convention */
const global = globalThis as any;

global.process = {
  env: {},
};

class Collator {
  constructor(_locales?: unknown, _options?: unknown) {}

  compare(a: string, b: string) {
    return a.localeCompare(b);
  }
}

global.Intl = { Collator };
