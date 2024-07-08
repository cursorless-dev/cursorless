import { FakeCommandServerApi } from "@cursorless/common";
import {
  createCursorlessEngine,
  type CommandApi,
} from "@cursorless/cursorless-engine";
import { Context } from "talon";
import { TalonJsFileSystem } from "./TalonJsFileSystem";
import { TalonJsHats } from "./TalonJsHats";
import { TalonJsTreeSitter } from "./TalonJsTreeSitter";
import { TalonJsIDE } from "./ide/TalonJsIDE";

async function activate(): Promise<void> {
  const talonJsIDE = new TalonJsIDE();
  const hats = new TalonJsHats();
  const fileSystem = new TalonJsFileSystem();
  const treeSitter = new TalonJsTreeSitter();

  const commandServerApi = new FakeCommandServerApi();

  print("activate talon.js");

  //   const { commandApi } = await createCursorlessEngine(
  //     treeSitter,
  //     talonJsIDE,
  //     hats,
  //     commandServerApi,
  //     fileSystem,
  //   );

  //   registerCommands(commandApi);
}

// function registerCommands(commandApi: CommandApi) {
//   const ctx = new Context();

//   ctx.action_class("user", {
//     cursorless_js_command(...args: unknown[]) {
//       print("cursorless_js_command");
//       print(args);
//     //   return commandApi.runCommandSafe(...args);
//     },
//   });
// }

void activate();
