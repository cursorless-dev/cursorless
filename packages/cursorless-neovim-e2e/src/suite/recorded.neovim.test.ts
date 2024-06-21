import {
  TestCaseFixtureLegacy,
  asyncSafety,
  getRecordedTestPaths,
  runRecordedTest,
} from "@cursorless/common";
import {
  NeovimIDE,
  NeovimTextEditorImpl,
  NewEditorOptions,
  getCursorlessApi,
  runCursorlessCommand,
} from "@cursorless/neovim-common";
import * as yaml from "js-yaml";
import type { NeovimClient } from "neovim";
import { promises as fsp } from "node:fs";
import { endToEndTestSetup, sleepWithBackoff } from "../endToEndTestSetup";
import { shouldRunTest } from "../shouldRunTest";

suite("recorded test cases", async function () {
  const { getSpy, getNeovimIDE } = endToEndTestSetup(this);

  suiteSetup(async () => {});

  const tests = getRecordedTestPaths();

  for (const { name, path } of tests) {
    test(
      name,
      asyncSafety(async () => {
        /**
         * The neovim client is set by the test runner in test-harness/src/index.ts into the global object.
         * This allows us to access it in the tests that are executed through mocha.
         */
        const client = (global as any).additionalParameters.client;

        const buffer = await fsp.readFile(path);
        const fixture = yaml.load(buffer.toString()) as TestCaseFixtureLegacy;
        if (!shouldRunTest(name, fixture)) {
          return this.ctx.skip();
        }

        await runRecordedTest({
          path,
          spyIde: getSpy()!,
          openNewTestEditor: async (content: string, languageId: string) => {
            return await openNewTestEditor(client, getNeovimIDE()!, content, {
              languageId,
            });
          },
          sleepWithBackoff,
          testHelpers: (await getCursorlessApi()).testHelpers!,
          runCursorlessCommand,
        });
      }),
    );
  }
});

// NOTE: When the nvim-data/swap folder gets too big, neovim will start
// displaying a "press enter or type command to continue" message for every ":enew" command
// so the workaround is to delete that folder.
async function openNewTestEditor(
  client: NeovimClient,
  neovimIDE: NeovimIDE,
  content: string,
  { languageId = "plaintext", openBeside = false }: NewEditorOptions = {},
): Promise<NeovimTextEditorImpl> {
  // open a new buffer
  // @see: https://vi.stackexchange.com/questions/8345/a-built-in-way-to-make-vim-open-a-new-buffer-with-file
  await client.command(":enew");

  if (!openBeside) {
    // close all the other buffers
    // @see: https://stackoverflow.com/questions/4545275/vim-close-all-buffers-but-this-one
    await client.command(":BufOnly!");
  }

  // standardise newlines so we can easily split the lines
  const newLines = content.replace(/(?:\r\n|\r|\n)/g, "\n").split("\n");

  // set the buffer contents
  const window = await client.window;
  const buffer = await window.buffer;
  await buffer.setLines(newLines, { start: 0, end: -1, strictIndexing: false });

  // Not sure it matters but we try to set the right end of line type
  const eol = content.includes("\r\n") ? "CRLF" : "LF";
  // https://stackoverflow.com/questions/82726/convert-dos-windows-line-endings-to-linux-line-endings-in-vim
  if (eol === "CRLF") {
    await client.command(":set ff=dos");
  } else {
    await client.command(":set ff=unix");
  }

  const editor = await neovimIDE.updateTextEditor();

  return editor;
}
