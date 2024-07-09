import {
  FakeCommandServerApi,
  FakeIDE,
  NormalizedIDE,
} from "@cursorless/common";
import {
  createCursorlessEngine,
  type CommandApi,
} from "@cursorless/cursorless-engine";
import { Context } from "talon";
import { TalonJsFileSystem } from "./TalonJsFileSystem";
import { TalonJsHats } from "./TalonJsHats";
import { TalonJsSnippets } from "./TalonJsSnippets";
import { TalonJsTreeSitter } from "./TalonJsTreeSitter";
import { TalonJsIDE } from "./ide/TalonJsIDE";

async function activate(): Promise<void> {
  const talonJsIDE = new TalonJsIDE();
  const hats = new TalonJsHats();
  const fileSystem = new TalonJsFileSystem();
  const treeSitter = new TalonJsTreeSitter();
  const snippets = new TalonJsSnippets();
  const commandServerApi = new FakeCommandServerApi();

  const normalizedIde =
    talonJsIDE.runMode === "production"
      ? talonJsIDE
      : new NormalizedIDE(
          talonJsIDE,
          new FakeIDE(),
          talonJsIDE.runMode === "test",
        );

  const { commandApi } = await createCursorlessEngine(
    treeSitter,
    normalizedIde,
    hats,
    commandServerApi,
    fileSystem,
    snippets,
  );

  registerCommands(talonJsIDE, commandApi);
}

function registerCommands(talonJsIDE: TalonJsIDE, commandApi: CommandApi) {
  const ctx = new Context();

  ctx.action_class("user", {
    cursorless_js_run_command(...args: unknown[]) {
      print("cursorless_js_run_command");
      print(args);
      talonJsIDE.updateTextEditor();
      return commandApi.runCommandSafe(...args);
    },
  });
}

print("activate talon.js");

void activate();
