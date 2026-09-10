// oxlint-disable import/no-nodejs-modules -- This test runner executes in Node.
import { glob } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type Mocha from "mocha";

export async function runMochaWebTests(mocha: Mocha): Promise<number> {
  const files: string[] = [];

  for await (const file of glob("src/test/**/*.test.{ts,tsx}")) {
    files.push(path.resolve(file));
  }

  if (files.length === 0) {
    throw new Error("No cheatsheet test files found");
  }

  // Mocha 12's loader tries require() first. Import explicitly so tsx's ESM
  // loader transforms TSX before Node evaluates it, including with sync hooks.
  for (const file of files.toSorted()) {
    mocha.suite.emit("pre-require", globalThis, file, mocha);
    const tests = await import(pathToFileURL(file).href);
    mocha.suite.emit("require", tests, file, mocha);
    mocha.suite.emit("post-require", globalThis, file, mocha);
  }

  return new Promise((resolve) => {
    mocha.run((failures) => resolve(failures === 0 ? 0 : 1));
  });
}
